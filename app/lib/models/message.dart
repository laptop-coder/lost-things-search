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

  factory Message.fromJson(Map<String, dynamic> json) => Message(
    id: json['id'] as String,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    senderId: json['senderId'] as String,
    content: json['content'] as String,
    isRead: json['isRead'] as bool,
  );
}
