import { useQuery } from '@tanstack/react-query'
import { useStore } from '@tanstack/react-store'
import { setField, wizardStore } from '#/lib/order/store'
import { apiFetch } from '#/lib/api'
import { Field, OptionChip, StepHeader } from '../primitives'
import { cn } from '#/lib/utils'

type Artist = {
  id: string
  name: string
  voice_description: string | null
  best_for: string[] | null
  genres: string[] | null
  image_url: string | null
}

export function StepArtist() {
  const data = useStore(wizardStore, (s) => s.data)

  const { data: artists, isLoading, isError } = useQuery({
    queryKey: ['artists'],
    queryFn: () => apiFetch<Artist[]>('/api/artists'),
    retry: false,
  })

  return (
    <div className="space-y-6">
      <StepHeader title="Choose your artist" subtitle="Pick a voice, or let us match one to your story." />

      <div className="flex gap-2">
        <OptionChip
          label="Help me choose"
          selected={data.artist_mode === 'help_me_choose'}
          onClick={() => {
            setField('artist_mode', 'help_me_choose')
            setField('artist_id', undefined)
          }}
        />
        <OptionChip
          label="Pick an artist"
          selected={data.artist_mode === 'pick'}
          onClick={() => setField('artist_mode', 'pick')}
        />
      </div>

      {data.artist_mode === 'pick' && (
        <Field>
          {isLoading && <p className="text-sm text-muted-foreground">Loading artists…</p>}
          {isError && (
            <p className="text-sm text-muted-foreground">
              Couldn't load artists (is the api running?). You can still continue with
              “Help me choose”.
            </p>
          )}
          {artists && artists.length === 0 && (
            <p className="text-sm text-muted-foreground">No artists yet.</p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {artists?.map((a) => {
              const selected = data.artist_id === a.id
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setField('artist_id', a.id)}
                  className={cn(
                    'flex gap-3 rounded-xl border p-4 text-left transition-colors',
                    selected ? 'border-gold bg-accent/30 ring-2 ring-gold/40 shadow-soft' : 'border-input hover:border-primary/50',
                  )}
                >
                  <div className="size-12 shrink-0 rounded-full bg-muted" aria-hidden />
                  <div>
                    <div className="font-medium">{a.name}</div>
                    {a.voice_description && (
                      <div className="text-xs text-muted-foreground">{a.voice_description}</div>
                    )}
                    {a.best_for && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Best for: {a.best_for.join(', ')}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Field>
      )}
    </div>
  )
}
