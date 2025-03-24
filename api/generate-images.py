from http.server import BaseHTTPRequestHandler
import json
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
XAI_API_KEY = os.getenv("XAI_API_KEY")

def generate_character_image(character_data):
    """
    Generate a pixel art sprite for a character using X.AI
    """
    if not XAI_API_KEY:
        # Return placeholder if no API key
        return {"image_url": "https://placehold.co/200x250?text=Character"}
    
    name = character_data.get("Name", "Unknown Character")
    description = character_data.get("Character_Summary", "")

    prompt = f"""Create a pixel art sprite of:
name: {name}
description: {description}

Style: Low resolution, 4-6 colors, background is white (character is not), bold outlines, no lines on the character itself, simplified design.
Instructions: If a public figure, it should look like them."""

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {XAI_API_KEY}"
        }
        
        data = {
            "model": "grok-2-image",
            "prompt": prompt,
            "n": 1
        }
        
        response = requests.post(
            "https://api.x.ai/v1/images/generations",
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            image_url = result['data'][0]['url']
            return {"image_url": image_url}
        else:
            # Return placeholder on error
            return {"image_url": "https://placehold.co/200x250?text=Error", "error": response.text}
            
    except Exception as e:
        # Return placeholder on exception
        return {"image_url": "https://placehold.co/200x250?text=Error", "error": str(e)}

# This is used by Vercel
def handler(request):
    """
    Handler function for Vercel
    """
    try:
        # Get the request method
        method = request.get('method', '')
        
        if method == 'POST':
            # Get the body
            body = json.loads(request.get('body', '{}'))
            character_data = body.get('character_data', {})
            
            # Generate image
            result = generate_character_image(character_data)
            
            # Return the image URL
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }
        else:
            # Method not allowed
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({"error": "Method not allowed"})
            }
            
    except Exception as e:
        # Return error message
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({"error": str(e)})
        }