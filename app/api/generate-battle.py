from http.server import BaseHTTPRequestHandler
import json
import os
import requests
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
XAI_API_KEY = os.getenv("XAI_API_KEY")

def create_battle_query(topic="rappers in 2025"):
    """
    Creates a query for ChatGPT to generate a battle simulation based on a given topic
    """
    query = f"""The topic is: "{topic}" Use the web results as context. Identify 2 characters to simulate interactions. Each character has an HP total ranging from 1- 500. 4 moves with damage ranging from 1-150, and a character summary describing its strengths and weaknesses. Select a background that they would battle in. Format the response in a JSON in the following format: 
    {{
        "Character 1": {{
            "Name": "****",
            "HP": "****",
            "Character_Summary": "*Summarize the important points of the character with strengths and weaknesses",
            "Moves": {{
                "Move_1": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }},
                "Move_2": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }},
                "Move_3": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }},
                "Move_4": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }}
            }}
        }},
        "Character 2": {{
            "Name": "****",
            "HP": "****",
            "Character_Summary": "*Summarize the important points of the character with strengths and weaknesses",
            "Moves": {{
                "Move_1": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }},
                "Move_2": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }},
                "Move_3": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }},
                "Move_4": {{
                    "Move_name": "****",
                    "Description": "****",
                    "Damage": "****"
                }}
            }}
        }},
        "Background" : "****"
    }}"""
    
    return query

def query_chatgpt(prompt):
    """
    Sends a query to the ChatGPT API and returns the response
    """
    if not OPENAI_API_KEY:
        raise ValueError("No OpenAI API key found. Set the OPENAI_API_KEY environment variable.")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    data = {
        "model": "gpt-3.5-turbo",  # Using 3.5-turbo for cost efficiency
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=data
    )
    
    if response.status_code != 200:
        raise Exception(f"Error: {response.status_code}, {response.text}")
    
    return response.json()

def extract_battle_data(response_data):
    """
    Extracts battle data from ChatGPT response
    """
    # Extract the message content
    content = response_data['choices'][0]['message']['content']
    
    # Try to find and parse the JSON part of the response
    try:
        # Look for JSON structure in the response
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = content[json_start:json_end]
            battle_data = json.loads(json_str)
            return battle_data
        else:
            raise ValueError("No JSON found in the response")
            
    except json.JSONDecodeError:
        raise ValueError("Could not parse JSON from response")

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
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            image_url = result['data'][0]['url']
            return {"image_url": image_url}
        else:
            # Return placeholder on error
            return {"image_url": "https://placehold.co/200x250?text=Error"}
            
    except Exception:
        # Return placeholder on exception
        return {"image_url": "https://placehold.co/200x250?text=Error"}

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
            topic = body.get('topic', 'rappers in 2025')
            
            # Create the battle query
            query = create_battle_query(topic)
            
            # Send the query to ChatGPT
            response = query_chatgpt(query)
            
            # Extract battle data
            battle_data = extract_battle_data(response)
            
            # Try to generate character images
            # This is done asynchronously since it's not critical
            try:
                char1_data = battle_data.get("Character 1", {})
                char2_data = battle_data.get("Character 2", {})
                
                # Generate images for both characters
                image1_result = generate_character_image(char1_data)
                image2_result = generate_character_image(char2_data)
                
                # Add image URLs to battle data
                if "image_url" in image1_result:
                    battle_data["Character 1"]["image_url"] = image1_result["image_url"]
                
                if "image_url" in image2_result:
                    battle_data["Character 2"]["image_url"] = image2_result["image_url"]
            except Exception:
                # If image generation fails, continue without images
                pass
            
            # Return the battle data
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps(battle_data)
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