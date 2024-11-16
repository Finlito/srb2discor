import { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";
import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get('frame_id') != null;
let discordSdk;
if (isEmbedded) {
    discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
} else {
    // We're using session storage for user_id, guild_id, and channel_id
    // This way the user/guild/channel will be maintained until the tab is closed, even if you refresh
    // Session storage will generate new unique mocks for each tab you open
    // Any of these values can be overridden via query parameters
    // i.e. if you set https://my-tunnel-url.com/?user_id=test_user_id
    // this will override this will override the session user_id value
    const mockUserId = getOverrideOrRandomSessionValue('user_id');
    const mockGuildId = getOverrideOrRandomSessionValue('guild_id');
    const mockChannelId = getOverrideOrRandomSessionValue('channel_id');
    discordSdk = new DiscordSDKMock(import.meta.env.VITE_DISCORD_CLIENT_ID, mockGuildId, mockChannelId);
    const discriminator = String(mockUserId.charCodeAt(0) % 5);
    discordSdk._updateCommandMocks({
        authenticate: async ()=>{
            return {
                access_token: 'mock_token',
                user: {
                    username: mockUserId,
                    discriminator,
                    id: mockUserId,
                    avatar: null,
                    public_flags: 1
                },
                scopes: [],
                expires: new Date(2112, 1, 1).toString(),
                application: {
                    description: 'mock_app_description',
                    icon: 'mock_app_icon',
                    id: 'mock_app_id',
                    name: 'mock_app_name'
                }
            };
        }
    });
}
export { discordSdk };
var SessionStorageQueryParam = /*#__PURE__*/ function(SessionStorageQueryParam) {
    SessionStorageQueryParam["user_id"] = "user_id";
    SessionStorageQueryParam["guild_id"] = "guild_id";
    SessionStorageQueryParam["channel_id"] = "channel_id";
    return SessionStorageQueryParam;
}(SessionStorageQueryParam || {});
function getOverrideOrRandomSessionValue(queryParam) {
    const overrideValue = queryParams.get(queryParam);
    if (overrideValue != null) {
        return overrideValue;
    }
    const currentStoredValue = sessionStorage.getItem(queryParam);
    if (currentStoredValue != null) {
        return currentStoredValue;
    }
    // Set queryParam to a random 8-character string
    const randomString = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(queryParam, randomString);
    return randomString;
}
const DiscordContext = /*#__PURE__*/ createContext({
    accessToken: null,
    authenticated: false,
    discordSdk: discordSdk,
    error: null,
    session: {
        user: {
            id: '',
            username: '',
            discriminator: '',
            avatar: null,
            public_flags: 0
        },
        access_token: '',
        scopes: [],
        expires: '',
        application: {
            rpc_origins: undefined,
            id: '',
            name: '',
            icon: null,
            description: ''
        }
    },
    status: 'pending'
});
export function DiscordContextProvider(props) {
    const { authenticate, children, loadingScreen = null, scope } = props;
    const setupResult = useDiscordSdkSetup({
        authenticate,
        scope
    });
    if (loadingScreen && ![
        'error',
        'ready'
    ].includes(setupResult.status)) {
        return /*#__PURE__*/ React.createElement(React.Fragment, null, loadingScreen);
    }
    return /*#__PURE__*/ React.createElement(DiscordContext.Provider, {
        value: setupResult
    }, children);
}
export function useDiscordSdk() {
    return useContext(DiscordContext);
}
/**
 * Authenticate with Discord and return the access token.
 * See full list of scopes: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 *
 * @param scope The scope of the authorization (default: ['identify', 'guilds'])
 * @returns The result of the Discord SDK `authenticate()` command
 */ export async function authenticateSdk(options) {
    const { scope = [
        'identify',
        'guilds'
    ] } = options ?? {};
    await discordSdk.ready();
    const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: scope
    });
    const response = await fetch('/.proxy/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code
        })
    });
    const { access_token } = await response.json();
    // Authenticate with Discord client (using the access_token)
    const auth = await discordSdk.commands.authenticate({
        access_token
    });
    if (auth == null) {
        throw new Error('Authenticate command failed');
    }
    return {
        accessToken: access_token,
        auth
    };
}
export function useDiscordSdkSetup(options) {
    const { authenticate, scope } = options ?? {};
    const [accessToken, setAccessToken] = useState(null);
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('pending');
    const setupDiscordSdk = useCallback(async ()=>{
        try {
            setStatus('loading');
            await discordSdk.ready();
            if (authenticate) {
                setStatus('authenticating');
                const { accessToken, auth } = await authenticateSdk({
                    scope
                });
                setAccessToken(accessToken);
                setSession(auth);
            }
            setStatus('ready');
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred');
            }
            setStatus('error');
        }
    }, [
        authenticate
    ]);
    useStableEffect(()=>{
        setupDiscordSdk();
    });
    return {
        accessToken,
        authenticated: !!accessToken,
        discordSdk,
        error,
        session,
        status
    };
}
/**
 * React in development mode re-mounts the root component initially.
 * This hook ensures that the callback is only called once, preventing double authentication.
 */ function useStableEffect(callback) {
    const isRunning = useRef(false);
    useEffect(()=>{
        if (!isRunning.current) {
            isRunning.current = true;
            callback();
        }
    }, []);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxkaXNjXFx0ZXN0XFxzcmNcXGhvb2tzXFx1c2VEaXNjb3JkU2RrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXNjb3JkU0RLLCBEaXNjb3JkU0RLTW9jayB9IGZyb20gJ0BkaXNjb3JkL2VtYmVkZGVkLWFwcC1zZGsnXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlUmVmLCBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuXG50eXBlIFVud3JhcFByb21pc2U8VD4gPSBUIGV4dGVuZHMgUHJvbWlzZTxpbmZlciBVPiA/IFUgOiBUXG50eXBlIERpc2NvcmRTZXNzaW9uID0gVW53cmFwUHJvbWlzZTxSZXR1cm5UeXBlPHR5cGVvZiBkaXNjb3JkU2RrLmNvbW1hbmRzLmF1dGhlbnRpY2F0ZT4+XG50eXBlIEF1dGhvcml6ZUlucHV0ID0gUGFyYW1ldGVyczx0eXBlb2YgZGlzY29yZFNkay5jb21tYW5kcy5hdXRob3JpemU+WzBdXG50eXBlIFNka1NldHVwUmVzdWx0ID0gUmV0dXJuVHlwZTx0eXBlb2YgdXNlRGlzY29yZFNka1NldHVwPlxuXG5jb25zdCBxdWVyeVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaClcbmNvbnN0IGlzRW1iZWRkZWQgPSBxdWVyeVBhcmFtcy5nZXQoJ2ZyYW1lX2lkJykgIT0gbnVsbFxuXG5sZXQgZGlzY29yZFNkazogRGlzY29yZFNESyB8IERpc2NvcmRTREtNb2NrXG5cbmlmIChpc0VtYmVkZGVkKSB7XG5cdGRpc2NvcmRTZGsgPSBuZXcgRGlzY29yZFNESyhpbXBvcnQubWV0YS5lbnYuVklURV9ESVNDT1JEX0NMSUVOVF9JRClcbn0gZWxzZSB7XG5cdC8vIFdlJ3JlIHVzaW5nIHNlc3Npb24gc3RvcmFnZSBmb3IgdXNlcl9pZCwgZ3VpbGRfaWQsIGFuZCBjaGFubmVsX2lkXG5cdC8vIFRoaXMgd2F5IHRoZSB1c2VyL2d1aWxkL2NoYW5uZWwgd2lsbCBiZSBtYWludGFpbmVkIHVudGlsIHRoZSB0YWIgaXMgY2xvc2VkLCBldmVuIGlmIHlvdSByZWZyZXNoXG5cdC8vIFNlc3Npb24gc3RvcmFnZSB3aWxsIGdlbmVyYXRlIG5ldyB1bmlxdWUgbW9ja3MgZm9yIGVhY2ggdGFiIHlvdSBvcGVuXG5cdC8vIEFueSBvZiB0aGVzZSB2YWx1ZXMgY2FuIGJlIG92ZXJyaWRkZW4gdmlhIHF1ZXJ5IHBhcmFtZXRlcnNcblx0Ly8gaS5lLiBpZiB5b3Ugc2V0IGh0dHBzOi8vbXktdHVubmVsLXVybC5jb20vP3VzZXJfaWQ9dGVzdF91c2VyX2lkXG5cdC8vIHRoaXMgd2lsbCBvdmVycmlkZSB0aGlzIHdpbGwgb3ZlcnJpZGUgdGhlIHNlc3Npb24gdXNlcl9pZCB2YWx1ZVxuXHRjb25zdCBtb2NrVXNlcklkID0gZ2V0T3ZlcnJpZGVPclJhbmRvbVNlc3Npb25WYWx1ZSgndXNlcl9pZCcpXG5cdGNvbnN0IG1vY2tHdWlsZElkID0gZ2V0T3ZlcnJpZGVPclJhbmRvbVNlc3Npb25WYWx1ZSgnZ3VpbGRfaWQnKVxuXHRjb25zdCBtb2NrQ2hhbm5lbElkID0gZ2V0T3ZlcnJpZGVPclJhbmRvbVNlc3Npb25WYWx1ZSgnY2hhbm5lbF9pZCcpXG5cblx0ZGlzY29yZFNkayA9IG5ldyBEaXNjb3JkU0RLTW9jayhpbXBvcnQubWV0YS5lbnYuVklURV9ESVNDT1JEX0NMSUVOVF9JRCwgbW9ja0d1aWxkSWQsIG1vY2tDaGFubmVsSWQpXG5cdGNvbnN0IGRpc2NyaW1pbmF0b3IgPSBTdHJpbmcobW9ja1VzZXJJZC5jaGFyQ29kZUF0KDApICUgNSlcblxuXHRkaXNjb3JkU2RrLl91cGRhdGVDb21tYW5kTW9ja3Moe1xuXHRcdGF1dGhlbnRpY2F0ZTogYXN5bmMgKCkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YWNjZXNzX3Rva2VuOiAnbW9ja190b2tlbicsXG5cdFx0XHRcdHVzZXI6IHtcblx0XHRcdFx0XHR1c2VybmFtZTogbW9ja1VzZXJJZCxcblx0XHRcdFx0XHRkaXNjcmltaW5hdG9yLFxuXHRcdFx0XHRcdGlkOiBtb2NrVXNlcklkLFxuXHRcdFx0XHRcdGF2YXRhcjogbnVsbCxcblx0XHRcdFx0XHRwdWJsaWNfZmxhZ3M6IDFcblx0XHRcdFx0fSxcblx0XHRcdFx0c2NvcGVzOiBbXSxcblx0XHRcdFx0ZXhwaXJlczogbmV3IERhdGUoMjExMiwgMSwgMSkudG9TdHJpbmcoKSxcblx0XHRcdFx0YXBwbGljYXRpb246IHtcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogJ21vY2tfYXBwX2Rlc2NyaXB0aW9uJyxcblx0XHRcdFx0XHRpY29uOiAnbW9ja19hcHBfaWNvbicsXG5cdFx0XHRcdFx0aWQ6ICdtb2NrX2FwcF9pZCcsXG5cdFx0XHRcdFx0bmFtZTogJ21vY2tfYXBwX25hbWUnXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pXG59XG5cbmV4cG9ydCB7IGRpc2NvcmRTZGsgfVxuXG5lbnVtIFNlc3Npb25TdG9yYWdlUXVlcnlQYXJhbSB7XG5cdHVzZXJfaWQgPSAndXNlcl9pZCcsXG5cdGd1aWxkX2lkID0gJ2d1aWxkX2lkJyxcblx0Y2hhbm5lbF9pZCA9ICdjaGFubmVsX2lkJ1xufVxuXG5mdW5jdGlvbiBnZXRPdmVycmlkZU9yUmFuZG9tU2Vzc2lvblZhbHVlKHF1ZXJ5UGFyYW06IGAke1Nlc3Npb25TdG9yYWdlUXVlcnlQYXJhbX1gKSB7XG5cdGNvbnN0IG92ZXJyaWRlVmFsdWUgPSBxdWVyeVBhcmFtcy5nZXQocXVlcnlQYXJhbSlcblx0aWYgKG92ZXJyaWRlVmFsdWUgIT0gbnVsbCkge1xuXHRcdHJldHVybiBvdmVycmlkZVZhbHVlXG5cdH1cblxuXHRjb25zdCBjdXJyZW50U3RvcmVkVmFsdWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKHF1ZXJ5UGFyYW0pXG5cdGlmIChjdXJyZW50U3RvcmVkVmFsdWUgIT0gbnVsbCkge1xuXHRcdHJldHVybiBjdXJyZW50U3RvcmVkVmFsdWVcblx0fVxuXG5cdC8vIFNldCBxdWVyeVBhcmFtIHRvIGEgcmFuZG9tIDgtY2hhcmFjdGVyIHN0cmluZ1xuXHRjb25zdCByYW5kb21TdHJpbmcgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCAxMClcblx0c2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShxdWVyeVBhcmFtLCByYW5kb21TdHJpbmcpXG5cdHJldHVybiByYW5kb21TdHJpbmdcbn1cblxuY29uc3QgRGlzY29yZENvbnRleHQgPSBjcmVhdGVDb250ZXh0PFNka1NldHVwUmVzdWx0Pih7XG5cdGFjY2Vzc1Rva2VuOiBudWxsLFxuXHRhdXRoZW50aWNhdGVkOiBmYWxzZSxcblx0ZGlzY29yZFNkazogZGlzY29yZFNkayxcblx0ZXJyb3I6IG51bGwsXG5cdHNlc3Npb246IHtcblx0XHR1c2VyOiB7XG5cdFx0XHRpZDogJycsXG5cdFx0XHR1c2VybmFtZTogJycsXG5cdFx0XHRkaXNjcmltaW5hdG9yOiAnJyxcblx0XHRcdGF2YXRhcjogbnVsbCxcblx0XHRcdHB1YmxpY19mbGFnczogMFxuXHRcdH0sXG5cdFx0YWNjZXNzX3Rva2VuOiAnJyxcblx0XHRzY29wZXM6IFtdLFxuXHRcdGV4cGlyZXM6ICcnLFxuXHRcdGFwcGxpY2F0aW9uOiB7XG5cdFx0XHRycGNfb3JpZ2luczogdW5kZWZpbmVkLFxuXHRcdFx0aWQ6ICcnLFxuXHRcdFx0bmFtZTogJycsXG5cdFx0XHRpY29uOiBudWxsLFxuXHRcdFx0ZGVzY3JpcHRpb246ICcnXG5cdFx0fVxuXHR9LFxuXHRzdGF0dXM6ICdwZW5kaW5nJ1xufSlcblxuaW50ZXJmYWNlIERpc2NvcmRDb250ZXh0UHJvdmlkZXJQcm9wcyB7XG5cdGF1dGhlbnRpY2F0ZT86IGJvb2xlYW5cblx0Y2hpbGRyZW46IFJlYWN0Tm9kZVxuXHRsb2FkaW5nU2NyZWVuPzogUmVhY3ROb2RlXG5cdHNjb3BlPzogQXV0aG9yaXplSW5wdXRbJ3Njb3BlJ11cbn1cbmV4cG9ydCBmdW5jdGlvbiBEaXNjb3JkQ29udGV4dFByb3ZpZGVyKHByb3BzOiBEaXNjb3JkQ29udGV4dFByb3ZpZGVyUHJvcHMpIHtcblx0Y29uc3QgeyBhdXRoZW50aWNhdGUsIGNoaWxkcmVuLCBsb2FkaW5nU2NyZWVuID0gbnVsbCwgc2NvcGUgfSA9IHByb3BzXG5cdGNvbnN0IHNldHVwUmVzdWx0ID0gdXNlRGlzY29yZFNka1NldHVwKHsgYXV0aGVudGljYXRlLCBzY29wZSB9KVxuXG5cdGlmIChsb2FkaW5nU2NyZWVuICYmICFbJ2Vycm9yJywgJ3JlYWR5J10uaW5jbHVkZXMoc2V0dXBSZXN1bHQuc3RhdHVzKSkge1xuXHRcdHJldHVybiA8Pntsb2FkaW5nU2NyZWVufTwvPlxuXHR9XG5cblx0cmV0dXJuIDxEaXNjb3JkQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2V0dXBSZXN1bHR9PntjaGlsZHJlbn08L0Rpc2NvcmRDb250ZXh0LlByb3ZpZGVyPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGlzY29yZFNkaygpIHtcblx0cmV0dXJuIHVzZUNvbnRleHQoRGlzY29yZENvbnRleHQpXG59XG5cbmludGVyZmFjZSBBdXRoZW50aWNhdGVTZGtPcHRpb25zIHtcblx0c2NvcGU/OiBBdXRob3JpemVJbnB1dFsnc2NvcGUnXVxufVxuXG4vKipcbiAqIEF1dGhlbnRpY2F0ZSB3aXRoIERpc2NvcmQgYW5kIHJldHVybiB0aGUgYWNjZXNzIHRva2VuLlxuICogU2VlIGZ1bGwgbGlzdCBvZiBzY29wZXM6IGh0dHBzOi8vZGlzY29yZC5jb20vZGV2ZWxvcGVycy9kb2NzL3RvcGljcy9vYXV0aDIjc2hhcmVkLXJlc291cmNlcy1vYXV0aDItc2NvcGVzXG4gKlxuICogQHBhcmFtIHNjb3BlIFRoZSBzY29wZSBvZiB0aGUgYXV0aG9yaXphdGlvbiAoZGVmYXVsdDogWydpZGVudGlmeScsICdndWlsZHMnXSlcbiAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgdGhlIERpc2NvcmQgU0RLIGBhdXRoZW50aWNhdGUoKWAgY29tbWFuZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXV0aGVudGljYXRlU2RrKG9wdGlvbnM/OiBBdXRoZW50aWNhdGVTZGtPcHRpb25zKSB7XG5cdGNvbnN0IHsgc2NvcGUgPSBbJ2lkZW50aWZ5JywgJ2d1aWxkcyddIH0gPSBvcHRpb25zID8/IHt9XG5cblx0YXdhaXQgZGlzY29yZFNkay5yZWFkeSgpXG5cdGNvbnN0IHsgY29kZSB9ID0gYXdhaXQgZGlzY29yZFNkay5jb21tYW5kcy5hdXRob3JpemUoe1xuXHRcdGNsaWVudF9pZDogaW1wb3J0Lm1ldGEuZW52LlZJVEVfRElTQ09SRF9DTElFTlRfSUQsXG5cdFx0cmVzcG9uc2VfdHlwZTogJ2NvZGUnLFxuXHRcdHN0YXRlOiAnJyxcblx0XHRwcm9tcHQ6ICdub25lJyxcblx0XHRzY29wZTogc2NvcGVcblx0fSlcblxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvLnByb3h5L2FwaS90b2tlbicsIHtcblx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG5cdFx0fSxcblx0XHRib2R5OiBKU09OLnN0cmluZ2lmeSh7IGNvZGUgfSlcblx0fSlcblx0Y29uc3QgeyBhY2Nlc3NfdG9rZW4gfSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuXG5cdC8vIEF1dGhlbnRpY2F0ZSB3aXRoIERpc2NvcmQgY2xpZW50ICh1c2luZyB0aGUgYWNjZXNzX3Rva2VuKVxuXHRjb25zdCBhdXRoID0gYXdhaXQgZGlzY29yZFNkay5jb21tYW5kcy5hdXRoZW50aWNhdGUoeyBhY2Nlc3NfdG9rZW4gfSlcblxuXHRpZiAoYXV0aCA9PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBdXRoZW50aWNhdGUgY29tbWFuZCBmYWlsZWQnKVxuXHR9XG5cdHJldHVybiB7IGFjY2Vzc1Rva2VuOiBhY2Nlc3NfdG9rZW4sIGF1dGggfVxufVxuXG5pbnRlcmZhY2UgVXNlRGlzY29yZFNka1NldHVwT3B0aW9ucyB7XG5cdGF1dGhlbnRpY2F0ZT86IGJvb2xlYW5cblx0c2NvcGU/OiBBdXRob3JpemVJbnB1dFsnc2NvcGUnXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGlzY29yZFNka1NldHVwKG9wdGlvbnM/OiBVc2VEaXNjb3JkU2RrU2V0dXBPcHRpb25zKSB7XG5cdGNvbnN0IHsgYXV0aGVudGljYXRlLCBzY29wZSB9ID0gb3B0aW9ucyA/PyB7fVxuXHRjb25zdCBbYWNjZXNzVG9rZW4sIHNldEFjY2Vzc1Rva2VuXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG5cdGNvbnN0IFtzZXNzaW9uLCBzZXRTZXNzaW9uXSA9IHVzZVN0YXRlPERpc2NvcmRTZXNzaW9uIHwgbnVsbD4obnVsbClcblx0Y29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuXHRjb25zdCBbc3RhdHVzLCBzZXRTdGF0dXNdID0gdXNlU3RhdGU8J2F1dGhlbnRpY2F0aW5nJyB8ICdlcnJvcicgfCAnbG9hZGluZycgfCAncGVuZGluZycgfCAncmVhZHknPigncGVuZGluZycpXG5cblx0Y29uc3Qgc2V0dXBEaXNjb3JkU2RrID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRzZXRTdGF0dXMoJ2xvYWRpbmcnKVxuXHRcdFx0YXdhaXQgZGlzY29yZFNkay5yZWFkeSgpXG5cblx0XHRcdGlmIChhdXRoZW50aWNhdGUpIHtcblx0XHRcdFx0c2V0U3RhdHVzKCdhdXRoZW50aWNhdGluZycpXG5cdFx0XHRcdGNvbnN0IHsgYWNjZXNzVG9rZW4sIGF1dGggfSA9IGF3YWl0IGF1dGhlbnRpY2F0ZVNkayh7IHNjb3BlIH0pXG5cdFx0XHRcdHNldEFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuKVxuXHRcdFx0XHRzZXRTZXNzaW9uKGF1dGgpXG5cdFx0XHR9XG5cblx0XHRcdHNldFN0YXR1cygncmVhZHknKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSlcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdFx0c2V0RXJyb3IoZS5tZXNzYWdlKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2V0RXJyb3IoJ0FuIHVua25vd24gZXJyb3Igb2NjdXJyZWQnKVxuXHRcdFx0fVxuXHRcdFx0c2V0U3RhdHVzKCdlcnJvcicpXG5cdFx0fVxuXHR9LCBbYXV0aGVudGljYXRlXSlcblxuXHR1c2VTdGFibGVFZmZlY3QoKCkgPT4ge1xuXHRcdHNldHVwRGlzY29yZFNkaygpXG5cdH0pXG5cblx0cmV0dXJuIHsgYWNjZXNzVG9rZW4sIGF1dGhlbnRpY2F0ZWQ6ICEhYWNjZXNzVG9rZW4sIGRpc2NvcmRTZGssIGVycm9yLCBzZXNzaW9uLCBzdGF0dXMgfVxufVxuXG4vKipcbiAqIFJlYWN0IGluIGRldmVsb3BtZW50IG1vZGUgcmUtbW91bnRzIHRoZSByb290IGNvbXBvbmVudCBpbml0aWFsbHkuXG4gKiBUaGlzIGhvb2sgZW5zdXJlcyB0aGF0IHRoZSBjYWxsYmFjayBpcyBvbmx5IGNhbGxlZCBvbmNlLCBwcmV2ZW50aW5nIGRvdWJsZSBhdXRoZW50aWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gdXNlU3RhYmxlRWZmZWN0KGNhbGxiYWNrOiAoKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPikge1xuXHRjb25zdCBpc1J1bm5pbmcgPSB1c2VSZWYoZmFsc2UpXG5cblx0dXNlRWZmZWN0KCgpID0+IHtcblx0XHRpZiAoIWlzUnVubmluZy5jdXJyZW50KSB7XG5cdFx0XHRpc1J1bm5pbmcuY3VycmVudCA9IHRydWVcblx0XHRcdGNhbGxiYWNrKClcblx0XHR9XG5cdH0sIFtdKVxufVxuIl0sIm5hbWVzIjpbIkRpc2NvcmRTREsiLCJEaXNjb3JkU0RLTW9jayIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ2FsbGJhY2siLCJ1c2VSZWYiLCJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInF1ZXJ5UGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJpc0VtYmVkZGVkIiwiZ2V0IiwiZGlzY29yZFNkayIsImVudiIsIlZJVEVfRElTQ09SRF9DTElFTlRfSUQiLCJtb2NrVXNlcklkIiwiZ2V0T3ZlcnJpZGVPclJhbmRvbVNlc3Npb25WYWx1ZSIsIm1vY2tHdWlsZElkIiwibW9ja0NoYW5uZWxJZCIsImRpc2NyaW1pbmF0b3IiLCJTdHJpbmciLCJjaGFyQ29kZUF0IiwiX3VwZGF0ZUNvbW1hbmRNb2NrcyIsImF1dGhlbnRpY2F0ZSIsImFjY2Vzc190b2tlbiIsInVzZXIiLCJ1c2VybmFtZSIsImlkIiwiYXZhdGFyIiwicHVibGljX2ZsYWdzIiwic2NvcGVzIiwiZXhwaXJlcyIsIkRhdGUiLCJ0b1N0cmluZyIsImFwcGxpY2F0aW9uIiwiZGVzY3JpcHRpb24iLCJpY29uIiwibmFtZSIsIlNlc3Npb25TdG9yYWdlUXVlcnlQYXJhbSIsInF1ZXJ5UGFyYW0iLCJvdmVycmlkZVZhbHVlIiwiY3VycmVudFN0b3JlZFZhbHVlIiwic2Vzc2lvblN0b3JhZ2UiLCJnZXRJdGVtIiwicmFuZG9tU3RyaW5nIiwiTWF0aCIsInJhbmRvbSIsInNsaWNlIiwic2V0SXRlbSIsIkRpc2NvcmRDb250ZXh0IiwiYWNjZXNzVG9rZW4iLCJhdXRoZW50aWNhdGVkIiwiZXJyb3IiLCJzZXNzaW9uIiwicnBjX29yaWdpbnMiLCJ1bmRlZmluZWQiLCJzdGF0dXMiLCJEaXNjb3JkQ29udGV4dFByb3ZpZGVyIiwicHJvcHMiLCJjaGlsZHJlbiIsImxvYWRpbmdTY3JlZW4iLCJzY29wZSIsInNldHVwUmVzdWx0IiwidXNlRGlzY29yZFNka1NldHVwIiwiaW5jbHVkZXMiLCJQcm92aWRlciIsInZhbHVlIiwidXNlRGlzY29yZFNkayIsImF1dGhlbnRpY2F0ZVNkayIsIm9wdGlvbnMiLCJyZWFkeSIsImNvZGUiLCJjb21tYW5kcyIsImF1dGhvcml6ZSIsImNsaWVudF9pZCIsInJlc3BvbnNlX3R5cGUiLCJzdGF0ZSIsInByb21wdCIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJqc29uIiwiYXV0aCIsIkVycm9yIiwic2V0QWNjZXNzVG9rZW4iLCJzZXRTZXNzaW9uIiwic2V0RXJyb3IiLCJzZXRTdGF0dXMiLCJzZXR1cERpc2NvcmRTZGsiLCJlIiwiY29uc29sZSIsIm1lc3NhZ2UiLCJ1c2VTdGFibGVFZmZlY3QiLCJjYWxsYmFjayIsImlzUnVubmluZyIsImN1cnJlbnQiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFVBQVUsRUFBRUMsY0FBYyxRQUFRLDRCQUEyQjtBQUN0RSxTQUFTQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxNQUFNLEVBQUVDLGFBQWEsRUFBRUMsVUFBVSxRQUFRLFFBQU87QUFRM0YsTUFBTUMsY0FBYyxJQUFJQyxnQkFBZ0JDLE9BQU9DLFFBQVEsQ0FBQ0MsTUFBTTtBQUM5RCxNQUFNQyxhQUFhTCxZQUFZTSxHQUFHLENBQUMsZUFBZTtBQUVsRCxJQUFJQztBQUVKLElBQUlGLFlBQVk7SUFDZkUsYUFBYSxJQUFJZixXQUFXLFlBQVlnQixHQUFHLENBQUNDLHNCQUFzQjtBQUNuRSxPQUFPO0lBQ04sb0VBQW9FO0lBQ3BFLGtHQUFrRztJQUNsRyx1RUFBdUU7SUFDdkUsNkRBQTZEO0lBQzdELGtFQUFrRTtJQUNsRSxrRUFBa0U7SUFDbEUsTUFBTUMsYUFBYUMsZ0NBQWdDO0lBQ25ELE1BQU1DLGNBQWNELGdDQUFnQztJQUNwRCxNQUFNRSxnQkFBZ0JGLGdDQUFnQztJQUV0REosYUFBYSxJQUFJZCxlQUFlLFlBQVllLEdBQUcsQ0FBQ0Msc0JBQXNCLEVBQUVHLGFBQWFDO0lBQ3JGLE1BQU1DLGdCQUFnQkMsT0FBT0wsV0FBV00sVUFBVSxDQUFDLEtBQUs7SUFFeERULFdBQVdVLG1CQUFtQixDQUFDO1FBQzlCQyxjQUFjO1lBQ2IsT0FBTztnQkFDTkMsY0FB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