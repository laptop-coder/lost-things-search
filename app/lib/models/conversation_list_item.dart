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

  factory ConversationListItem.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': String id,
        'updatedAt': String updatedAt,
        'postId': String postId,
        'postName': String postName,
        'unreadCount': int unreadCount,
        'lastMessage': String? lastMessage,
      } =>
        ConversationListItem(
          id: id,
          updatedAt: updatedAt,
          postId: postId,
          postName: postName,
          unreadCount: unreadCount,
          lastMessage: lastMessage,
        ),
      _ => throw const FormatException('Не удалось загрузить переписку'),
    };
  }
}



