from http.server import BaseHTTPRequestHandler
import json
import os
import random
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_narrative(attacker, defender, move, description):
    """
    Generate narrative for a battle move using OpenAI API
    """
    if not OPENAI_API_KEY:
        return generate_fallback_narrative(attacker, defender, move, description)
    
    # Create a more detailed prompt for the LLM
    prompt = f"""
Generate an exciting battle narrative in a Pokemon-style game.

Attacker: {attacker}
Defender: {defender}
Move: {move}
Move Description: {description}

Write a short, dynamic narrative (1-2 sentences) describing this attack and its impact.
Make it exciting and varied in style. Include varied battle effects and impacts.
Use a tone similar to Pokemon battles or anime fight scenes.
Do not include quotation marks.
"""
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a battle narrator for a Pokemon-style game."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 100
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=10  # 10-second timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            narrative = result["choices"][0]["message"]["content"].strip()
            return narrative
        else:
            return generate_fallback_narrative(attacker, defender, move, description)
    
    except Exception:
        return generate_fallback_narrative(attacker, defender, move, description)

def generate_fallback_narrative(attacker, defender, move, description):
    """
    Generate a fallback narrative if API call fails
    """
    effects = [
        "It's super effective!",
        "It's not very effective...",
        "A critical hit!",
        "The attack landed perfectly!",
        f"{defender} is staggered!",
        f"{defender} barely withstood the attack!",
        "The crowd goes wild!",
        "What an impressive display of power!"
    ]
    
    effect = random.choice(effects)
    
    return f"{attacker} used {move}! {description} {effect}"

def handler(event, context):
    """
    Lambda handler function for Vercel
    """
    try:
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        attacker = body.get('attacker', '')
        defender = body.get('defender', '')
        move = body.get('move', '')
        description = body.get('moveDescription', '')
        
        # Generate narrative
        narrative = generate_narrative(attacker, defender, move, description)
        
        # Return the narrative
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # CORS header
            },
            'body': json.dumps({"narrative": narrative})
        }
    except Exception as e:
        # Return error message
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # CORS header
            },
            'body': json.dumps({"error": str(e)})
        }

# Vercel function handler format
def lambda_handler(event, context):
    return handler(event, context)