import { useState } from "react";
import { Link } from "wouter";
import { Search, Bell, Menu, User } from "lucide-react";
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

interface NavbarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

export default function Navbar({ onMenuClick, showSearch = true }: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [notificationCount] = useState(3);
  const [isLoggedIn] = useState(true);

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
              placeholder="Konu, eğitimci veya içerik ara..."
              className="w-full pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              data-testid="input-search"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>

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
                    <Link href="/settings" data-testid="link-settings">
                      Ayarlar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="button-logout">
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button data-testid="button-login">Giriş Yap</Button>
          )}
        </div>
      </div>
    </nav>
  );
}
