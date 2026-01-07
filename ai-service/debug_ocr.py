import sys
import os
import cv2
import numpy as np
from PIL import Image

# Add current directory to path so imports work
sys.path.append(os.getcwd())

from models.yolo_detector import detect_vehicle_and_plate
from models.ocr_extractor import extract_text_with_preprocessing

def debug_image(image_path):
    print(f"Processing image: {image_path}")
    
    try:
        # Load image
        img = Image.open(image_path)
        img_np = np.array(img)
        
        # Step 1: Detect
        print("Running YOLO detection...")
        detection = detect_vehicle_and_plate(img_np)
        
        if not detection:
            print("❌ No vehicle/plate detected by YOLO.")
            return
            
        print("✅ Detection successful.")
        print(f"Plate Box: {detection.get('box')}")
        
        # Save cropped plate for inspection
        plate_img = detection['plate_image']
        artifact_dir = "/Users/nischalsingana/.gemini/antigravity/brain/86824d1f-e57d-4676-8b66-1e3ce3f499d7"
        
        debug_plate_path = os.path.join(artifact_dir, "debug_plate_crop.png")
        Image.fromarray(plate_img).save(debug_plate_path)
        print(f"Saved debug plate crop to: {debug_plate_path}")

        # Test Multiple Preprocessing Methods
        import cv2
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False) # Re-init locally to access directly if needed, or stick to imported function logic if adaptable

        # Since extract_text_with_preprocessing is hardcoded, we will manually run variations here
        # or we can modify extract_text_with_preprocessing to accept a method?
        # Let's write the loop here manually using the same easyocr instance
        
        methods = {
            "original": plate_img,
            "grayscale": cv2.cvtColor(plate_img, cv2.COLOR_RGB2GRAY),
            "otsu": cv2.threshold(cv2.cvtColor(plate_img, cv2.COLOR_RGB2GRAY), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1],
            "adaptive": cv2.adaptiveThreshold(cv2.cvtColor(plate_img, cv2.COLOR_RGB2GRAY), 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        }
        
        print("\n--- OCR Method Comparison ---")
        for name, img in methods.items():
            results = reader.readtext(img, detail=1, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
            
            print(f"Method [{name}]:")
            full_text = ""
            for (bbox, text, conf) in results:
                print(f"  - Found: '{text}' (Conf: {conf:.2f})")
                full_text += text
            
            print(f"  -> Combined: '{full_text}'\n")

            # Save debug image
            save_path = os.path.join(artifact_dir, f"debug_ocr_{name}.png")
            Image.fromarray(img).save(save_path)
        print(f"Debug Info: {ocr_result.get('debug')}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_ocr.py <image_path>")
    else:
        debug_image(sys.argv[1])
