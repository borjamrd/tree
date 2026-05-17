import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface Props {
  inviterName: string
  treeName: string
  acceptUrl: string
}

export function InvitationEmail({ inviterName, treeName, acceptUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} te invitó a colaborar en un árbol genealógico</Preview>
      <Body style={{ fontFamily: 'Georgia, serif', backgroundColor: '#f9f7f4', padding: '40px 0' }}>
        <Container
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px 40px',
            border: '1px solid #e8e4df',
          }}
        >
          <Text
            style={{
              fontSize: '11px',
              fontFamily: 'sans-serif',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#a8a29e',
              margin: '0 0 32px',
            }}
          >
            Treel
          </Text>
          <Heading
            style={{
              fontSize: '22px',
              fontWeight: '400',
              color: '#1c1917',
              margin: '0 0 16px',
              lineHeight: '1.3',
            }}
          >
            Has sido invitado/a a colaborar en &ldquo;{treeName}&rdquo;
          </Heading>
          <Text
            style={{
              color: '#78716c',
              fontSize: '15px',
              lineHeight: '1.7',
              margin: '0 0 32px',
            }}
          >
            <strong style={{ color: '#1c1917', fontWeight: '500' }}>{inviterName}</strong> quiere
            que colabores en su árbol genealógico. Haz clic en el botón para aceptar la invitación y
            acceder al árbol.
          </Text>
          <Section style={{ textAlign: 'center', margin: '0 0 40px' }}>
            <Button
              href={acceptUrl}
              style={{
                backgroundColor: '#1c1917',
                color: '#fff',
                padding: '13px 32px',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'sans-serif',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Aceptar invitación
            </Button>
          </Section>
          <Text
            style={{
              color: '#a8a29e',
              fontSize: '12px',
              fontFamily: 'sans-serif',
              lineHeight: '1.6',
              borderTop: '1px solid #f5f3f1',
              paddingTop: '24px',
              margin: '0',
            }}
          >
            Esta invitación caduca en 7 días. Si no esperabas este mensaje, puedes ignorarlo sin
            problema.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
