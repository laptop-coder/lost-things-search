class Message {
  final String id;
  final String createdAt;
  final String updatedAt;
  final String senderId;
  final String content;
  final bool isRead;

  const Message({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.senderId,
    required this.content,
    required this.isRead,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': String id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'senderId': String senderId,
        'content': String content,
        'isRead': bool isRead,
      } =>
        Message(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          senderId: senderId,
          content: content,
          isRead: isRead,
        ),
      _ => throw const FormatException('Не удалось загрузить сообщение'),
    };
  }
}
