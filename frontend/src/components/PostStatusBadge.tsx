import { createSignal } from "solid-js";
import { PostModerationStatus } from "../lib/types";

interface Props {
  moderationStatus: PostModerationStatus;
  thingReturnedToOwner: boolean;
}

const PostStatusBadge = (props: Props) => {
  // use map instead of dynamic classes, because otherwise Tailwind will not
  // include styles in final CSS
  const styleMap = {
    info: "bg-surface-2 text-text-muted",
    success: "bg-success text-bg",
    urgent: "bg-urgent text-bg",
    warning: "bg-warning text-bg",
  };
  const [styleClasses, setStyleClasses] = createSignal(styleMap.info);
  const messagesMap = {
    pending: "Ожидание модерации",
    inProgress: "На рассмотрении",
    approved: "Опубликовано",
    rejected: "Отклонено",
    found: "Найдено",
    needsReview: "Дополнительная проверка",
  };
  const [message, setMessage] = createSignal(messagesMap.pending);
  switch (props.moderationStatus) {
    case PostModerationStatus.Pending:
      setStyleClasses(styleMap.info);
      setMessage(messagesMap.pending);
      break;
    case PostModerationStatus.InProgress:
      setStyleClasses(styleMap.info);
      setMessage(messagesMap.inProgress);
      break;
    case PostModerationStatus.AutoApproved:
    case PostModerationStatus.Approved:
      if (props.thingReturnedToOwner) {
        setStyleClasses(styleMap.success);
        setMessage(messagesMap.found);
      } else {
        setStyleClasses(styleMap.success);
        setMessage(messagesMap.approved);
      }
      break;
    case PostModerationStatus.AutoRejected:
    case PostModerationStatus.Rejected:
      setStyleClasses(styleMap.urgent);
      setMessage(messagesMap.rejected);
      break;
    case PostModerationStatus.NeedsReview:
      setStyleClasses(styleMap.warning);
      setMessage(messagesMap.needsReview);
      break;
  }
  return (
    <div class={`px-2 py-0.5 ${styleClasses()} text-xs rounded-full`}>
      {message()}
    </div>
  );
};

export default PostStatusBadge;
