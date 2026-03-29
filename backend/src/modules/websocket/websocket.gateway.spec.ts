import { HotelWebSocketGateway } from './websocket.gateway';

describe('HotelWebSocketGateway', () => {
  let gateway: HotelWebSocketGateway;

  const mockClient = () => ({
    id: 'client-1',
    handshake: { auth: { empresaId: 'emp-1' } },
    join: jest.fn(),
  });

  beforeEach(() => {
    gateway = new HotelWebSocketGateway();
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;
  });

  it('handleConnection joins empresa room when empresaId present', () => {
    const client = mockClient();
    gateway.handleConnection(client as any);
    expect(client.join).toHaveBeenCalledWith('empresa:emp-1');
  });

  it('handleConnection does not join when empresaId absent', () => {
    const client = {
      id: 'client-2',
      handshake: { auth: {} },
      join: jest.fn(),
    };
    gateway.handleConnection(client as any);
    expect(client.join).not.toHaveBeenCalled();
  });

  it('handleDisconnect does not throw', () => {
    const client = { id: 'client-1' };
    expect(() =>
      gateway.handleDisconnect(client as any),
    ).not.toThrow();
  });

  it('handleJoinEmpresa joins the specified room', () => {
    const client = mockClient();
    gateway.handleJoinEmpresa(client as any, 'emp-2');
    expect(client.join).toHaveBeenCalledWith('empresa:emp-2');
  });

  it('emitToEmpresa emits event to empresa room', () => {
    gateway.emitToEmpresa('emp-1', 'reserva-created', {
      id: 'r-1',
    });
    expect(gateway.server.to).toHaveBeenCalledWith(
      'empresa:emp-1',
    );
  });
});
