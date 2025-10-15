import {
  type Icon,
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash
} from '@tabler/icons-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '~/components/ui/sidebar';

export function NavDocuments({
  items
}: {
  items: {
    name: string;
    url: string;
    icon: Icon;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel className='text-xs sm:text-sm px-2 sm:px-4'>
        Documents
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className='px-2 sm:px-3 py-2 text-xs sm:text-sm'
            >
              <a href={item.url} className='flex items-center gap-2'>
                <item.icon className='h-3 w-3 sm:h-4 sm:w-4' />
                <span className='truncate'>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className='data-[state=open]:bg-accent rounded-sm h-6 w-6 sm:h-8 sm:w-8'
                >
                  <IconDots className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='sr-only'>More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-20 sm:w-24 rounded-xl text-xs sm:text-sm'
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem className='gap-1.5 sm:gap-2 py-1.5 sm:py-2'>
                  <IconFolder className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='gap-1.5 sm:gap-2 py-1.5 sm:py-2'>
                  <IconShare3 className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  className='gap-1.5 sm:gap-2 py-1.5 sm:py-2'
                >
                  <IconTrash className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className='text-sidebar-foreground/70 px-2 sm:px-3 py-2 text-xs sm:text-sm'>
            <IconDots className='text-sidebar-foreground/70 h-3 w-3 sm:h-4 sm:w-4' />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
