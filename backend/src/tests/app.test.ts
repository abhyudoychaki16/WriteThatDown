import { Server as SocketIOServer } from 'socket.io'; 
import { createServer, Server } from 'http';
import { expressApp as app } from '../app';
import { createUser } from '../UserUtils/CreateUser';

jest.mock('../UserUtils/CreateUser.ts')

describe('Socket.IO server tests with Jest', () => {
    let io: SocketIOServer;
    let httpServer: Server;
    beforeEach((done) => {
        httpServer = createServer(app);
        io = new SocketIOServer(httpServer);

        httpServer.listen(() => done());
    });

    afterEach((done) => {
        io.close();
        httpServer.close(done);
    });

    test('should handle SIGNUP event successfully', (done) => {
        const mockUser = { _id: 'testUserId' };

        const mockSocket = {
            on: jest.fn(),
            send: jest.fn(),
            user: undefined,
        };

        io.on('connection', (socket) => {
            socket.on('SIGNUP', async () => {
                expect(createUser).toHaveBeenCalledWith(
                    'John Doe', 'john@example.com', 'TestEnterprise', 'testPassword'
                );
                expect(socket.send).toHaveBeenCalledWith(`you have signed up, your id is: ${mockUser._id}`);
                done();
            });
        });

        mockSocket.on.mock.calls[0][1]({
            name: 'John Doe',
            email: 'john@example.com',
            enterprise: 'TestEnterprise',
            password: 'testPassword'
        });
    });
});