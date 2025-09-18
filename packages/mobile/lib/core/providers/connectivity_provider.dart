import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConnectivityState {
  final bool isConnected;
  final ConnectivityResult connectionType;

  ConnectivityState({required this.isConnected, required this.connectionType});

  ConnectivityState copyWith({
    bool? isConnected,
    ConnectivityResult? connectionType,
  }) {
    return ConnectivityState(
      isConnected: isConnected ?? this.isConnected,
      connectionType: connectionType ?? this.connectionType,
    );
  }
}

class ConnectivityNotifier extends StateNotifier<ConnectivityState> {
  final Connectivity _connectivity;

  ConnectivityNotifier(this._connectivity)
    : super(
        ConnectivityState(
          isConnected: false,
          connectionType: ConnectivityResult.none,
        ),
      ) {
    _init();
  }

  void _init() {
    _connectivity.onConnectivityChanged.listen((result) {
      state = state.copyWith(
        isConnected: result != ConnectivityResult.none,
        connectionType: result,
      );
    });

    // Check initial connectivity
    _checkInitialConnectivity();
  }

  Future<void> _checkInitialConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    state = state.copyWith(
      isConnected: result != ConnectivityResult.none,
      connectionType: result,
    );
  }
}

final connectivityProvider =
    StateNotifierProvider<ConnectivityNotifier, ConnectivityState>((ref) {
      return ConnectivityNotifier(Connectivity());
    });
