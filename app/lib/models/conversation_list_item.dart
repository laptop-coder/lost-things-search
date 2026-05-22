class ConversationListItem {
  final String id;
  final String updatedAt;
  final String postId;
  final String postName;
  final int unreadCount;
  final String? lastMessage;

  const ConversationListItem({
    required this.id,
    required this.updatedAt,
    required this.postId,
    required this.postName,
    required this.unreadCount,
    this.lastMessage,
  });

  factory ConversationListItem.fromJson(Map<String, dynamic> json) =>
      ConversationListItem(
        id: json['id'] as String,
        updatedAt: json['updatedAt'] as String,
        postId: json['postId'] as String,
        postName: json['postName'] as String,
        unreadCount: json['unreadCount'] as int,
        lastMessage: json['lastMessage'] as String?,
      );
}
