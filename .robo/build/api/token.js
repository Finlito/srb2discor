export default (async (req)=>{
    const { code } = await req.json();
    // Exchange the code for an access_token
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: process.env.VITE_DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code
        })
    });
    const { access_token } = await response.json();
    return {
        access_token
    };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxkaXNjXFx0ZXN0XFxzcmNcXGFwaVxcdG9rZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSb2JvUmVxdWVzdCB9IGZyb20gJ0Byb2JvanMvc2VydmVyJ1xuXG5pbnRlcmZhY2UgUmVxdWVzdEJvZHkge1xuXHRjb2RlOiBzdHJpbmdcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHJlcTogUm9ib1JlcXVlc3QpID0+IHtcblx0Y29uc3QgeyBjb2RlIH0gPSAoYXdhaXQgcmVxLmpzb24oKSkgYXMgUmVxdWVzdEJvZHlcblxuXHQvLyBFeGNoYW5nZSB0aGUgY29kZSBmb3IgYW4gYWNjZXNzX3Rva2VuXG5cdGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vZGlzY29yZC5jb20vYXBpL29hdXRoMi90b2tlbmAsIHtcblx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRoZWFkZXJzOiB7XG5cdFx0XHQnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcblx0XHR9LFxuXHRcdGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuXHRcdFx0Y2xpZW50X2lkOiBwcm9jZXNzLmVudi5WSVRFX0RJU0NPUkRfQ0xJRU5UX0lEISxcblx0XHRcdGNsaWVudF9zZWNyZXQ6IHByb2Nlc3MuZW52LkRJU0NPUkRfQ0xJRU5UX1NFQ1JFVCEsXG5cdFx0XHRncmFudF90eXBlOiAnYXV0aG9yaXphdGlvbl9jb2RlJyxcblx0XHRcdGNvZGU6IGNvZGVcblx0XHR9KVxuXHR9KVxuXHRjb25zdCB7IGFjY2Vzc190b2tlbiB9ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG5cblx0cmV0dXJuIHsgYWNjZXNzX3Rva2VuIH1cbn1cbiJdLCJuYW1lcyI6WyJyZXEiLCJjb2RlIiwianNvbiIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIlVSTFNlYXJjaFBhcmFtcyIsImNsaWVudF9pZCIsInByb2Nlc3MiLCJlbnYiLCJWSVRFX0RJU0NPUkRfQ0xJRU5UX0lEIiwiY2xpZW50X3NlY3JldCIsIkRJU0NPUkRfQ0xJRU5UX1NFQ1JFVCIsImdyYW50X3R5cGUiLCJhY2Nlc3NfdG9rZW4iXSwibWFwcGluZ3MiOiJBQU1BLGVBQWUsQ0FBQSxPQUFPQTtJQUNyQixNQUFNLEVBQUVDLElBQUksRUFBRSxHQUFJLE1BQU1ELElBQUlFLElBQUk7SUFFaEMsd0NBQXdDO0lBQ3hDLE1BQU1DLFdBQVcsTUFBTUMsTUFBTSxDQUFDLG9DQUFvQyxDQUFDLEVBQUU7UUFDcEVDLFFBQVE7UUFDUkMsU0FBUztZQUNSLGdCQUFnQjtRQUNqQjtRQUNBQyxNQUFNLElBQUlDLGdCQUFnQjtZQUN6QkMsV0FBV0MsUUFBUUMsR0FBRyxDQUFDQyxzQkFBc0I7WUFDN0NDLGVBQWVILFFBQVFDLEdBQUcsQ0FBQ0cscUJBQXFCO1lBQ2hEQyxZQUFZO1lBQ1pkLE1BQU1BO1FBQ1A7SUFDRDtJQUNBLE1BQU0sRUFBRWUsWUFBWSxFQUFFLEdBQUcsTUFBTWIsU0FBU0QsSUFBSTtJQUU1QyxPQUFPO1FBQUVjO0lBQWE7QUFDdkIsQ0FBQSxFQUFDIn0=