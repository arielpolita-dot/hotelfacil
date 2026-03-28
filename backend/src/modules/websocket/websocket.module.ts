import { Module } from '@nestjs/common';

import { HotelWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [HotelWebSocketGateway],
  exports: [HotelWebSocketGateway],
})
export class WebSocketModule {}
