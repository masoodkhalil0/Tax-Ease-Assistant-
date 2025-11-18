"""
Quick script to create placeholder icons for the Chrome extension
Run this from the extension/ folder
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple colored icon with text"""
    # Create a gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Add a circle
    margin = size // 4
    draw.ellipse([margin, margin, size-margin, size-margin], fill='#764ba2')
    
    # Add text
    text = "TE"
    try:
        # Try to use a nice font
        font_size = size // 3
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        # Fallback to default
        font = ImageFont.load_default()
    
    # Center the text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save
    os.makedirs('assets', exist_ok=True)
    img.save(f'assets/{filename}')
    print(f"✅ Created {filename}")

if __name__ == "__main__":
    print("Creating extension icons...")
    create_icon(16, 'icon16.png')
    create_icon(48, 'icon48.png')
    create_icon(128, 'icon128.png')
    print("\n🎉 All icons created successfully!")
    print("Icons are saved in the 'assets/' folder")