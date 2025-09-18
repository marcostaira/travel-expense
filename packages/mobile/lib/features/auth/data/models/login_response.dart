import 'package:equatable/equatable.dart';
import 'user_model.dart';

class LoginResponse extends Equatable {
  final UserModel user;
  final String accessToken;
  final String refreshToken;
  final int expiresIn;

  const LoginResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      user: UserModel.fromJson(json['user']),
      accessToken: json['tokens']['accessToken'],
      refreshToken: json['tokens']['refreshToken'],
      expiresIn: json['tokens']['expiresIn'],
    );
  }

  @override
  List<Object?> get props => [user, accessToken, refreshToken, expiresIn];
}

class RefreshTokenResponse extends Equatable {
  final String accessToken;
  final int expiresIn;

  const RefreshTokenResponse({
    required this.accessToken,
    required this.expiresIn,
  });

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      accessToken: json['accessToken'],
      expiresIn: json['expiresIn'],
    );
  }

  @override
  List<Object?> get props => [accessToken, expiresIn];
}
