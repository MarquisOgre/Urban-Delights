import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, FolderOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IndentSession {
  id: string;
  name: string;
  recipe_quantities: Record<string, number>;
  available_qty: Record<string, number>;
  created_at: string;
  updated_at: string;
}

interface IndentSessionManagerProps {
  recipeQuantities: Record<string, number>;
  availableQty: Record<string, number>;
  onLoadSession: (recipeQuantities: Record<string, number>, availableQty: Record<string, number>) => void;
}

const IndentSessionManager = ({ recipeQuantities, availableQty, onLoadSession }: IndentSessionManagerProps) => {
  const [sessions, setSessions] = useState<IndentSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const { toast } = useToast();

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('indent_sessions')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setSessions(data.map(s => ({
        ...s,
        recipe_quantities: (s.recipe_quantities || {}) as Record<string, number>,
        available_qty: (s.available_qty || {}) as Record<string, number>,
      })));
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSave = async () => {
    if (!sessionName.trim()) {
      toast({ title: "Please enter a session name", variant: "destructive" });
      return;
    }

    const hasData = Object.values(recipeQuantities).some(q => q > 0);
    if (!hasData) {
      toast({ title: "No data to save", description: "Enter some recipe quantities first", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('indent_sessions').insert({
      name: sessionName.trim(),
      recipe_quantities: recipeQuantities,
      available_qty: availableQty,
    });

    if (error) {
      toast({ title: "Error saving session", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session saved!", description: `"${sessionName}" saved successfully` });
      setSessionName('');
      setSaveOpen(false);
      fetchSessions();
    }
  };

  const handleLoad = (session: IndentSession) => {
    onLoadSession(session.recipe_quantities, session.available_qty);
    setLoadOpen(false);
    toast({ title: "Session loaded!", description: `"${session.name}" loaded successfully` });
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from('indent_sessions').delete().eq('id', id);
    if (!error) {
      toast({ title: "Session deleted", description: `"${name}" removed` });
      fetchSessions();
    }
  };

  return (
    <div className="flex gap-1">
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-xs sm:text-sm">
            <Save className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Indent Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Session name (e.g. March Order)"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <Button onClick={handleSave} className="w-full">Save Session</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={loadOpen} onOpenChange={(open) => { setLoadOpen(open); if (open) fetchSessions(); }}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-xs sm:text-sm">
            <FolderOpen className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Load</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Load Indent Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No saved sessions</p>
            ) : (
              sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <button
                    onClick={() => handleLoad(session)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium">{session.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(session.id, session.name); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndentSessionManager;
