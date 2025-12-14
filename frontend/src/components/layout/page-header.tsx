import { User, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type PageHeaderProps = {
  title: string;
  href?: string;
};

export const PageHeader = ({ title, href }: PageHeaderProps) => {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {href && (
          <Link href={href}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <h1 className="flex-1 text-left text-xl font-bold text-foreground sm:text-2xl">
          {title}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">山田 太郎</span>
              <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
                一般
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <span className="flex w-full items-center justify-between">
                一般
                <Badge variant="secondary" className="ml-2">
                  現在
                </Badge>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem>承認者</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
