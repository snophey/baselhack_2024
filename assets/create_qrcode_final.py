import qrcode
from qrcode.image.svg import SvgPathImage
from lxml import etree

def create_svg_qr_with_embedded_svg_and_color(url, center_svg_path, output_path, qr_color="black", square_size_ratio=0.2):
    # Step 1: Create a QR code with high error correction
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Step 2: Generate the QR code image as an SVG
    qr_img = qr.make_image(image_factory=SvgPathImage, fill_color="black")  # Initial color set to black

    # Convert the QR code SVG data to an editable XML structure
    qr_svg_data = qr_img.to_string()
    qr_root = etree.fromstring(qr_svg_data)

    # Step 3: Change the color of the QR code paths
    for element in qr_root.iter():
        if element.tag.endswith('path') and 'fill' in element.attrib:
            element.attrib['fill'] = qr_color  # Set the new color for QR code paths

    # Step 4: Get the size of the QR code from the viewBox attribute
    view_box = qr_root.attrib['viewBox'].split()
    width, height = float(view_box[2]), float(view_box[3])

    # Calculate the size and position of the center square
    square_size = min(width, height) * square_size_ratio
    x = (width - square_size) / 2
    y = (height - square_size) / 2

    # Step 5: Parse the center SVG as bytes to avoid encoding issues
    with open(center_svg_path, 'rb') as f:
        center_svg_data = f.read()
    center_svg_root = etree.fromstring(center_svg_data)

    # Set attributes for positioning and scaling of the embedded SVG
    center_svg_root.attrib['x'] = str(x)
    center_svg_root.attrib['y'] = str(y)
    center_svg_root.attrib['width'] = str(square_size)
    center_svg_root.attrib['height'] = str(square_size)

    # Add the embedded SVG to the QR code SVG
    qr_root.append(center_svg_root)

    # Step 6: Save the final SVG with the color-changed QR code and embedded SVG logo
    with open(output_path, "wb") as f:
        f.write(etree.tostring(qr_root))

# Example usage
if __name__ == "__main__":
    url = "https://www.example.com"
    center_svg_path = "./images/navbar.svg"  # Path to the SVG file to embed in the center
    output_path = "qr_code_with_colored_qr_and_embedded_white.svg"

    # Create a QR code with a color-shifted QR code part and an embedded SVG logo in the center
    create_svg_qr_with_embedded_svg_and_color(
        url, center_svg_path, output_path, qr_color="white"  # Change to "white" or another color if needed
    )
