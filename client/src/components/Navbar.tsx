import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, User, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import NotificationsPopover from "@/components/NotificationsPopover";

interface NavbarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

export default function Navbar({ onMenuClick, showSearch = true }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [, setLocation] = useLocation();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
  });

  const notificationCount = unreadData?.count || 0;

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-lg font-bold">LF</span>
          </div>
          <span className="hidden text-xl font-bold sm:inline-block">LearnFlow</span>
        </Link>

        {showSearch && (
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Konu veya içerik ara..."
              className="w-full pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              data-testid="input-search"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <NotificationsPopover unreadCount={notificationCount} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    data-testid="button-profile-menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.role === "admin" && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        Yönetici
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="link-profile">
                      Profilim
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" data-testid="link-bookmarks">
                      Kaydedilenler
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/likes" data-testid="link-likes">
                      Beğenilenler
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/jarvis" className="flex items-center gap-2" data-testid="link-jarvis">
                      <Bot className="h-4 w-4" />
                      Jarvis
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="link-admin">
                        Admin Paneli
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="cursor-pointer" data-testid="button-logout">
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" data-testid="button-register">
                <Link href="/auth?tab=register">Kayıt Ol</Link>
              </Button>
              <Button asChild data-testid="button-login">
                <Link href="/auth">Giriş Yap</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
