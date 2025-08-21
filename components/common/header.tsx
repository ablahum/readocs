import { cn } from '@/lib/utils'

export default function Header() {
  return (
    <header className={cn('w-full py-3 border-b')}>
      <div className='container mx-auto flex items-center justify-center'>
        <p className='text-2xl font-semibold tracking-tight italic'>
          REA
          <span className='font-serif font-light'>Docs.</span>
        </p>
      </div>
    </header>
  )
}
