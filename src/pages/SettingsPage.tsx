import usePageTitle from "../hooks/usePageTitle";

const SETTINGS_CARDS = [
  {
    icon: "settings",
    title: "Company Information",
    description: "Update name, logo, address and more.",
  },
  {
    icon: "magic_wand",
    title: "Import Data",
    description: "Bring your finance information from other app",
  },
  {
    icon: "people_group",
    title: "User Management",
    description: "Go to Trimble Admin Console and manage your users",
  },
];

export default function SettingsPage() {
  usePageTitle("Settings");
  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-auto">
      <div className="text-2xl text-foreground mb-6">Settings</div>

      <div className="flex flex-col gap-4">
        {SETTINGS_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex items-center gap-4 bg-background border-default rounded-lg p-6 cursor-pointer hover:bg-muted transition-colors"
          >
            <i className="modus-icons text-3xl text-primary">{card.icon}</i>
            <div>
              <div className="text-lg font-bold text-foreground">
                {card.title}
              </div>
              <div className="text-sm text-foreground-60">
                {card.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
