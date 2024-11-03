import { Center, Flex, Image, Text, Title } from "@mantine/core";
import logo from "../../assets/navbar.svg";

function G({ children }: { children: any }) {
  return <span style={{
    color: '#8ccd10',
    fontWeight: 750,
  }}>{children}</span>;
}

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
          Ich habe <G>a</G>lle <G>V</G>ersicherungs<G>b</G>edingungen gelesen, damit du es nicht tun musst.
          Lass uns dieses Versicherungsding zusammen verstehen!
        </Text>
      </Flex>
    </Center>
  )
}
