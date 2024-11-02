import { Center, Flex, Image, Text, Title } from "@mantine/core";
import logo from "../../assets/navbar.svg";

export function Hero() {
  return (
    <Center style={{
      marginTop: 100,
    }}>
      <Flex direction={"column"} align={"center"} justify={"center"} gap='sm' style={{
        maxWidth: 400,
      }}>
        <Image src={logo} alt="Logo" style={{
          maxWidth: 150,
        }} />
        <Title order={1}>Hi, ich bin NAVBÄR</Title>
        <Text style={{ textAlign: 'center' }}>
          Ich habe alle Versicherungsbedingungen gelesen, damit du es nicht tun musst.
          Lass uns dieses Versicherungsding zusammen verstehen!
        </Text>
      </Flex>
    </Center>
  )
}
