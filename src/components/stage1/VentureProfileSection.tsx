import { useEffect, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import type { VentureProfile } from '../../types/venture';

interface VentureProfileSectionProps {
  profile: VentureProfile;
  onSave: (nextProfile: VentureProfile) => void;
}

const PROFILE_FIELDS: {
  key: keyof VentureProfile;
  label: string;
  multiline?: boolean;
}[] = [
  { key: 'ventureName', label: 'Venture Name' },
  { key: 'businessCategory', label: 'Business Category' },
  { key: 'targetCustomer', label: 'Target Customer' },
  { key: 'endUsers', label: 'End Users' },
  { key: 'geography', label: 'Geography' },
  { key: 'revenueModel', label: 'Revenue Model' },
  { key: 'problem', label: 'Problem', multiline: true },
  { key: 'offer', label: 'Offer', multiline: true },
];

export function VentureProfileSection({
  profile,
  onSave,
}: VentureProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<VentureProfile>(profile);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const handleStartEdit = () => {
    setDraft(profile);
    setIsEditing(true);
    setJustSaved(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(draft);
    setIsEditing(false);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2600);
  };

  return (
    <section
      id="venture-profile"
      aria-labelledby="venture-profile-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2
            id="venture-profile-heading"
            className="font-display text-lg font-semibold text-slate-900"
          >
            01. Venture Profile
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Foundational positioning baseline for MessMind across customer
            segments, geography, and core offer.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {justSaved && !isEditing && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Saved
            </span>
          )}
          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {PROFILE_FIELDS.map((field) => {
              const inputId = `venture-profile-${field.key}`;
              return (
                <div
                  key={field.key}
                  className={field.multiline ? 'md:col-span-2' : ''}
                >
                  <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      id={inputId}
                      rows={3}
                      required
                      value={draft[field.key]}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    />
                  ) : (
                    <input
                      id={inputId}
                      type="text"
                      required
                      value={draft[field.key]}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-y-0">
          {PROFILE_FIELDS.map((field, index) => {
            const isFullWidth = field.multiline;
            return (
              <div
                key={field.key}
                className={`px-6 py-4 ${
                  isFullWidth ? 'md:col-span-2 md:border-t md:border-slate-200' : ''
                } ${
                  !isFullWidth && index >= 2 ? 'md:border-t md:border-slate-200' : ''
                } ${!isFullWidth && index % 2 === 1 ? 'md:border-l md:border-slate-200' : ''}`}
              >
                <dt className="text-xs font-medium text-slate-500">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-900">
                  {profile[field.key]}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}
