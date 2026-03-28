import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
@Injectable()
export class HotelWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(HotelWebSocketGateway.name);

  handleConnection(client: Socket): void {
    const empresaId = client.handshake.auth?.empresaId;

    if (empresaId) {
      client.join(`empresa:${empresaId}`);
      this.logger.log(
        `Client ${client.id} joined empresa:${empresaId}`,
      );
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-empresa')
  handleJoinEmpresa(
    client: Socket,
    empresaId: string,
  ): void {
    client.join(`empresa:${empresaId}`);
    this.logger.log(
      `Client ${client.id} joined empresa:${empresaId}`,
    );
  }

  emitToEmpresa(
    empresaId: string,
    event: string,
    data?: unknown,
  ): void {
    this.server
      .to(`empresa:${empresaId}`)
      .emit(event, data);
  }
}
