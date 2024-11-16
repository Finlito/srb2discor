import { DiscordContextProvider } from "../hooks/useDiscordSdk.js";
import { Activity } from "./Activity.js";
import "./App.css";
/**
 * Set `authenticate` to true to enable Discord authentication.
 * You can also set the `scope` prop to request additional permissions.
 *
 * ```
 * <DiscordContextProvider authenticate scope={['identify', 'guilds']}>
 *  <Activity />
 * </DiscordContextProvider>
 * ```
 *
 * Learn more:
 * https://robojs.dev/discord-activities/authentication
 */ export default function App() {
    return /*#__PURE__*/ React.createElement(DiscordContextProvider, null, /*#__PURE__*/ React.createElement(Activity, null));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxkaXNjXFx0ZXN0XFxzcmNcXGFwcFxcQXBwLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXNjb3JkQ29udGV4dFByb3ZpZGVyIH0gZnJvbSAnLi4vaG9va3MvdXNlRGlzY29yZFNkaydcbmltcG9ydCB7IEFjdGl2aXR5IH0gZnJvbSAnLi9BY3Rpdml0eSdcbmltcG9ydCAnLi9BcHAuY3NzJ1xuXG4vKipcbiAqIFNldCBgYXV0aGVudGljYXRlYCB0byB0cnVlIHRvIGVuYWJsZSBEaXNjb3JkIGF1dGhlbnRpY2F0aW9uLlxuICogWW91IGNhbiBhbHNvIHNldCB0aGUgYHNjb3BlYCBwcm9wIHRvIHJlcXVlc3QgYWRkaXRpb25hbCBwZXJtaXNzaW9ucy5cbiAqXG4gKiBgYGBcbiAqIDxEaXNjb3JkQ29udGV4dFByb3ZpZGVyIGF1dGhlbnRpY2F0ZSBzY29wZT17WydpZGVudGlmeScsICdndWlsZHMnXX0+XG4gKiAgPEFjdGl2aXR5IC8+XG4gKiA8L0Rpc2NvcmRDb250ZXh0UHJvdmlkZXI+XG4gKiBgYGBcbiAqXG4gKiBMZWFybiBtb3JlOlxuICogaHR0cHM6Ly9yb2JvanMuZGV2L2Rpc2NvcmQtYWN0aXZpdGllcy9hdXRoZW50aWNhdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG5cdHJldHVybiAoXG5cdFx0PERpc2NvcmRDb250ZXh0UHJvdmlkZXI+XG5cdFx0XHQ8QWN0aXZpdHkgLz5cblx0XHQ8L0Rpc2NvcmRDb250ZXh0UHJvdmlkZXI+XG5cdClcbn1cbiJdLCJuYW1lcyI6WyJEaXNjb3JkQ29udGV4dFByb3ZpZGVyIiwiQWN0aXZpdHkiLCJBcHAiXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLHNCQUFzQixRQUFRLDRCQUF3QjtBQUMvRCxTQUFTQyxRQUFRLFFBQVEsZ0JBQVk7QUFDckMsT0FBTyxZQUFXO0FBRWxCOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELGVBQWUsU0FBU0M7SUFDdkIscUJBQ0Msb0JBQUNGLDRDQUNBLG9CQUFDQztBQUdKIn0=