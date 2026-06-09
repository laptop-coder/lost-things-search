import torch
import numpy as np
from typing import Annotated
from fastapi import FastAPI, Form
from transformers import (
    pipeline,
    TextClassificationPipeline,
    AutoTokenizer,
    AutoModel,
    PreTrainedTokenizerFast,
    PreTrainedModel,
)
from ultralytics import YOLO
from datetime import datetime, timezone
from dictionary import en_to_ru


app = FastAPI()
# load models, tokenizer
check_inappropriate_content_model = pipeline(
    "text-classification", model="apanc/russian-inappropriate-messages"
)
computer_vision_model = YOLO("yolo26n.pt")
sts_model = AutoModel.from_pretrained("sergeyzh/rubert-mini-sts")
sts_tokenizer = AutoTokenizer.from_pretrained("sergeyzh/rubert-mini-sts")


def embed_bert_cls(
    text: str, model: PreTrainedModel, tokenizer: PreTrainedTokenizerFast
) -> np.ndarray:
    t = tokenizer(text, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        model_output = model(**{k: v.to(model.device) for k, v in t.items()})
    embeddings = model_output.last_hidden_state[:, 0, :]
    embeddings = torch.nn.functional.normalize(embeddings)
    return embeddings[0].cpu().numpy()


def is_string_inappropriate(
    content: str, model: TextClassificationPipeline
) -> tuple[bool, float]:
    [res] = model(content)
    label = str(res["label"])
    score = float(res["score"])
    if label == "LABEL_0":
        return False, score
    return True, score


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/moderate")
async def moderate(
    title: Annotated[str, Form()],
    description: Annotated[str | None, Form()],
    post_id: Annotated[str | None, Form()], # for photo accessing
):

    # check title
    inappropriate, score = is_string_inappropriate(
        title, check_inappropriate_content_model
    )
    if score < 0.7:
        return {"result": "need_check"}
    if inappropriate:
        return {"result": "reject"}

    # description is unnecessary
    if description is None:
        return {"result": "accept"}

    # check description
    inappropriate, score = is_string_inappropriate(
        description, check_inappropriate_content_model
    )
    if score < 0.7:
        return {"result": "need_check"}
    if inappropriate:
        return {"result": "reject"}

    # photo is unnecessary
    if post_id is None:
        return {"result": "accept"}

    # recognize things on photo
    results = computer_vision_model.predict(f"/storage/post_photos/{post_id}.jpeg")
    things_on_photo = []
    for result in results:
        if result.boxes is not None:
            class_ids = result.boxes.cls.int().tolist()
            class_names = [computer_vision_model.names[id] for id in class_ids]
            for name in class_names:
                things_on_photo.append(en_to_ru.get(name, name))

    if len(things_on_photo) == 0:
        return {"result": "need_check"}

    # get embeddings
    title_embedding = embed_bert_cls(title, sts_model, sts_tokenizer)
    desc_embedding = embed_bert_cls(description, sts_model, sts_tokenizer)
    photo_things_embeddings = [
        embed_bert_cls(thing, sts_model, sts_tokenizer) for thing in things_on_photo
    ]

    # calculate norms
    title_norm = np.linalg.norm(title_embedding)
    desc_norm = np.linalg.norm(desc_embedding)
    photo_thing_norms = [
        np.linalg.norm(embedding) for embedding in photo_things_embeddings
    ]

    # calculate composition
    title_photo_dot = max(
        [
            np.dot(title_embedding, thing_embedding)
            for thing_embedding in photo_things_embeddings
        ]
    )
    desc_photo_dot = max(
        [
            np.dot(desc_embedding, thing_embedding)
            for thing_embedding in photo_things_embeddings
        ]
    )

    # calculate similarity
    similarity = float(
        max(
            max(
                [
                    title_photo_dot / (title_norm * thing_norm)
                    for thing_norm in photo_thing_norms
                ]
            ),
            max(
                [
                    desc_photo_dot / (desc_norm * thing_norm)
                    for thing_norm in photo_thing_norms
                ]
            ),
        )
    )
    if similarity < 0.8:
        return {"result": "need_check"}
    return {"result": "accept"}
