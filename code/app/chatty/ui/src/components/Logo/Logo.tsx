import { Flex, Image } from "@mantine/core";
// import SVG
import logo from "../../assets/navbar.svg";
import { Link } from "react-router-dom";

export function Logo({ width, height }: { width: number; height: number }) {
  return (
    <Link to="/">
      <Image src={logo} width={width} height={height} alt="Logo" />
    </Link>
  )
}
