const Skeleton = (props: { class?: string }) => (
  <div class={`bg-surface animate-pulse rounded-lg ${props.class || ""}`} />
);

export default Skeleton;
