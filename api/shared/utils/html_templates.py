def get_action_response_html(status_color: str, status_icon: str, status_text: str, message: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Approval State</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #fafafa;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }}
            .card {{
                background: #ffffff;
                padding: 40px;
                border-radius: 12px;
                border: 1px solid #e4e4e7;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                text-align: center;
                max-width: 400px;
                width: 100%;
            }}
            .status-icon {{
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background-color: {status_color};
                display: inline-flex;
                justify-content: center;
                align-items: center;
                margin: 0 auto 20px;
                color: #ffffff;
                font-size: 24px;
                font-weight: bold;
            }}
            h1 {{
                font-size: 20px;
                font-weight: 800;
                color: #18181b;
                margin: 0 0 10px 0;
            }}
            p {{
                font-size: 14px;
                color: #71717a;
                line-height: 1.6;
                margin: 0;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="status-icon">{status_icon}</div>
            <h1>{status_text}</h1>
            <p>{message}</p>
        </div>
    </body>
    </html>
    """
