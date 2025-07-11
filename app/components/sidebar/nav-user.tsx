import { ChevronsUpDown, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { useAuth } from '~/context/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router';

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
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-full"
            >
              <SidebarMenuButton
                size="lg"
                className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:bg-accent/50 active:bg-accent data-[state=open]:bg-accent"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <Avatar className="h-9 w-9 rounded-lg ring-2 ring-border ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-sky-500">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.role}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180" />
              </SidebarMenuButton>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1">
                  <span className="text-sm font-medium leading-none tracking-tight">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.role}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
