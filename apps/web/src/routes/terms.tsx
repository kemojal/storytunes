import { createFileRoute } from '@tanstack/react-router'
import { LegalPage } from '#/components/site/legal-page'

export const Route = createFileRoute('/terms')({ component: Terms })

function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="May 2026">
      <p>
        Welcome to StoryTunes. By placing an order you agree to these terms. We
        create original, personalized songs as emotional gifts.
      </p>
      <h2>Your order</h2>
      <p>
        You provide the story and preferences; we create an original song using a
        blend of AI-assisted tools, human songwriting, and production. Delivery
        times are estimates, not guarantees.
      </p>
      <h2>Acceptable use</h2>
      <p>You agree not to request songs that:</p>
      <ul>
        <li>Copy or imitate a real artist, voice, melody, or copyrighted song.</li>
        <li>Contain hateful, harassing, explicit, or illegal content.</li>
        <li>Impersonate a real person without their consent, or defame anyone.</li>
      </ul>
      <p>We may decline or refund orders that violate these rules.</p>
      <h2>Usage rights</h2>
      <p>
        Your song is licensed for personal use. Commercial use is available as a
        paid add-on. Resale is not permitted unless separately licensed.
      </p>
      <h2>AI disclosure</h2>
      <p>
        Songs may be created using AI-assisted tools alongside human review and
        production. Premium packages may include additional human performance.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email support@storytunes.example.</p>
    </LegalPage>
  )
}
