import qrcode
from qrcode.image.svg import SvgPathImage

def create_svg_qr(url, output_path):
    # Create a QR code
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Generate the QR code image as an SVG
    qr_img = qr.make_image(image_factory=SvgPathImage)

    # Save the SVG file
    with open(output_path, "wb") as f:
        qr_img.save(f)

# Example usage
if __name__ == "__main__":
    url = "https://www.example.com"
    output_path = "transparent_qr_code.svg"

    # Create a QR code exported as an SVG with a transparent background
    create_svg_qr(url, output_path)
