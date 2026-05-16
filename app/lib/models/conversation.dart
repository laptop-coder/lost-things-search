import 'user.dart';
import 'post.dart';
import 'message.dart';

class Conversation {
  final String id;
  final String createdAt;
  final Post post;
  final List<Message> messages;
  final User otherUser;

  const Conversation({
    required this.id,
    required this.createdAt,
    required this.post,
    required this.messages,
    required this.otherUser,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': String id,
        'createdAt': String createdAt,
        'post': Post post,
        'messages': List<dynamic> messages,
        'otherUser': User otherUser,
      } =>
        Conversation(
          id: id,
          createdAt: createdAt,
          post: post,
          messages: messages
              .map((e) => Message.fromJson(e as Map<String, dynamic>))
              .toList(),
          otherUser: otherUser,
        ),
      _ => throw const FormatException('Не удалось загрузить ученика'),
    };
  }
}
