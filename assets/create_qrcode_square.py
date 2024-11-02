import qrcode
from qrcode.image.svg import SvgPathImage
from lxml import etree

def create_svg_qr_with_embedded_svg(url, center_svg_path, output_path, square_size_ratio=0.2):
    # Create a QR code with high error correction to support missing center data
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Generate the QR code image as an SVG
    qr_img = qr.make_image(image_factory=SvgPathImage)

    # Convert the QR code SVG data to an editable XML structure
    qr_svg_data = qr_img.to_string()
    qr_root = etree.fromstring(qr_svg_data)

    # Get the size of the QR code from the viewBox attribute
    view_box = qr_root.attrib['viewBox'].split()
    width, height = float(view_box[2]), float(view_box[3])

    # Calculate the size and position of the center square
    square_size = min(width, height) * square_size_ratio
    x = (width - square_size) / 2
    y = (height - square_size) / 2

    # Parse the center SVG as bytes to avoid encoding issues
    with open(center_svg_path, 'rb') as f:
        center_svg_data = f.read()
    center_svg_root = etree.fromstring(center_svg_data)

    # Set attributes for positioning and scaling
    center_svg_root.attrib['x'] = str(x)
    center_svg_root.attrib['y'] = str(y)
    center_svg_root.attrib['width'] = str(square_size)
    center_svg_root.attrib['height'] = str(square_size)

    # Add the embedded SVG to the QR code SVG
    qr_root.append(center_svg_root)

    # Save the modified QR code SVG to a file
    with open(output_path, "wb") as f:
        f.write(etree.tostring(qr_root))

# Example usage
if __name__ == "__main__":
    url = "https://www.chatavb.com"
    center_svg_path = "./images/navbar.svg"  # Your specified SVG path
    output_path = "./images/qr_code_with_embedded_logo.svg"

    # Create a QR code with an embedded SVG logo in the center
    create_svg_qr_with_embedded_svg(url, center_svg_path, output_path)
