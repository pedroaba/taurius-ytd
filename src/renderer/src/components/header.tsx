import Logo from '../assets/logo.png'

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 pb-0 w-screen max-w-[1200px] mx-auto">
      <div className="flex items-center gap-2">
        <img src={Logo} alt="Logo" className="size-10" />
        <h1 className="text-lg font-bold">Taurius-YT</h1>
      </div>
    </header>
  )
}
