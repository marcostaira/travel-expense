import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:travel_expense_mobile/features/auth/data/models/user_model.dart';
import 'package:travel_expense_mobile/features/auth/data/models/login_response.dart';
import 'package:travel_expense_mobile/core/config/app_config.dart';

abstract class AuthRepository {
  Future<LoginResponse> login(String email, String password);
  Future<LoginResponse> register({
    required String name,
    required String email,
    required String password,
    required String companyName,
    required String cnpj,
  });
  Future<UserModel> getCurrentUser();
  Future<RefreshTokenResponse> refreshToken(String refreshToken);
}

class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;
  
  AuthRepositoryImpl(this._dio);

  @override
  Future<LoginResponse> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      return LoginResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<LoginResponse> register({
    required String name,
    required String email,
    required String password,
    required String companyName,
    required String cnpj,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'name': name,
        'email': email,
        'password': password,
        'companyName': companyName,
        'cnpj': cnpj,
      });
      
      return LoginResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await _dio.get('/auth/me');
      return UserModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Future<RefreshTokenResponse> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      
      return RefreshTokenResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(DioException e) {
    if (e.response?.statusCode == 401) {
      return Exception('Credenciais inválidas');
    } else if (e.response?.statusCode == 400) {
      return Exception(e.response?.data['message'] ?? 'Dados inválidos');
    } else if (e.response?.statusCode == 500) {
      return Exception('Erro interno do servidor');
    } else {
      return Exception('Erro de conexão');
    }
  }
}

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  // Add interceptors for logging, auth, etc.
  if (AppConfig.enableLogging) {
    dio.interceptors.add(LogInterceptor());
  }

  return dio;
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRepositoryImpl(dio);
});