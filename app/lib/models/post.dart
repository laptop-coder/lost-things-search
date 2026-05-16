import 'user.dart';

class Post {
  final String id;
  final String createdAt;
  final String updatedAt;
  final String name;
  final String? description;
  final bool verified;
  final bool thingReturnedToOwner;
  final bool hasPhoto;
  final User author;

  const Post({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
    this.description,
    required this.verified,
    required this.thingReturnedToOwner,
    required this.hasPhoto,
    required this.author,
  });

  factory Post.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': String id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'name': String name,
        'description': String? description,
        'verified': bool verified,
        'thingReturnedToOwner': bool thingReturnedToOwner,
        'hasPhoto': bool hasPhoto,
        'author': User author,
      } =>
        Post(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          name: name,
          description: description,
          verified: verified,
          thingReturnedToOwner: thingReturnedToOwner,
          hasPhoto: hasPhoto,
          author: author,
        ),
      _ => throw const FormatException('Не удалось загрузить объявление'),
    };
  }
}
