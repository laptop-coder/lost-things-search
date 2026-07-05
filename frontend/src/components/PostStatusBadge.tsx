import { createSignal } from "solid-js";
import { PostModerationStatus } from "../lib/types";

interface Props {
  moderationStatus: PostModerationStatus;
  thingReturnedToOwner: boolean;
}

const PostStatusBadge = (props: Props) => {
  // use map instead of dynamic classes, because otherwise Tailwind will not
  // include colors in final CSS
  const colorMap = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  const [colorClasses, setColorClasses] = createSignal(colorMap.gray);
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
      setColorClasses(colorMap.gray);
      setMessage(messagesMap.pending);
      break;
    case PostModerationStatus.InProgress:
      setColorClasses(colorMap.yellow);
      setMessage(messagesMap.inProgress);
      break;
    case (PostModerationStatus.AutoApproved, PostModerationStatus.Approved):
      if (props.thingReturnedToOwner) {
        setColorClasses(colorMap.purple);
        setMessage(messagesMap.found);
      } else {
        setColorClasses(colorMap.green);
        setMessage(messagesMap.approved);
      }
      break;
    case (PostModerationStatus.AutoRejected, PostModerationStatus.Rejected):
      setColorClasses(colorMap.red);
      setMessage(messagesMap.rejected);
      break;
    case PostModerationStatus.NeedsReview:
      setColorClasses(colorMap.yellow);
      setMessage(messagesMap.needsReview);
      break;
  }
  return (
    <div class={`px-2 py-0.5 ${colorClasses()} text-xs rounded-full`}>
      {message()}
    </div>
  );
};

export default PostStatusBadge;
