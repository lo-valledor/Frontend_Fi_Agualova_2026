import { ChevronsUpDown, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '~/components/ui/sidebar';
import { useAuth } from '~/context/AuthContext';

interface NavUserProps {
  user: {
    name: string;
    username: string;
    avatar: string;
    role: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error('Error al cerrar sesión', error as any);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='group relative overflow-hidden rounded-md transition-colors duration-150 hover:bg-accent active:bg-accent data-[state=open]:bg-accent px-2 py-1.5'
            >
              <Avatar className='h-7 w-7 rounded-md ring-1 ring-border ring-offset-1 ring-offset-background transition-all duration-150 group-hover:ring-primary'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-md bg-primary text-primary-foreground text-xs font-bold'>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronsUpDown className='ml-auto h-3 w-3 text-muted-foreground transition-transform duration-150 group-hover:text-foreground group-data-[state=open]:rotate-180 shrink-0' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-48 sm:min-w-52 rounded-md text-xs sm:text-sm'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={8}
          >
            <DropdownMenuLabel className='font-normal p-1 sm:p-2'>
              <div className='flex items-center gap-2 sm:gap-3 p-1'>
                <Avatar className='h-8 w-8 rounded-md'>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className='rounded-md bg-primary text-primary-foreground text-xs font-bold'>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 min-w-0'>
                  <span className='text-xs sm:text-sm font-semibold leading-none tracking-tight truncate'>
                    {user.name}
                  </span>
                  <span className='text-[0.65rem] text-muted-foreground truncate mt-0.5'>
                    {user.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className='gap-2 text-destructive focus:text-destructive py-2 text-xs sm:text-sm'
            >
              <LogOut className='h-3.5 w-3.5' />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
