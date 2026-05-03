const Skeleton = (props: { class?: string }) => (
  <div class={`bg-gray-200 animate-pulse rounded-lg ${props.class || ""}`} />
);

export default Skeleton;
