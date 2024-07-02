import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { Card, CardContent, Grid, Button, CircularProgress, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { CabecalhoPdiEntity } from '../wizard/domain/entities/CabecalhoPdiEntity';
import PegarWizardPeloIdService from '../wizard/domain/services/PegarWizardPeloId.service';
import GeraResumoPdiService from '../wizard/domain/services/GeraResumoPdi.service';

const pegarWizardPeloIdService: PegarWizardPeloIdService = new PegarWizardPeloIdService();
const geraResumoPdiService: GeraResumoPdiService = new GeraResumoPdiService();

export default function Visualizar() {
  const router = useRouter();
  const [render, setRender] = React.useState<boolean>(false);
  const [pdi, setPdi] = React.useState<CabecalhoPdiEntity>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [dialogContent, setDialogContent] = React.useState<string>('');
  const { wizardId } = router.query;

  React.useEffect(() => {
    const fetchData = async () => {
      if (wizardId) {
        const response = await pegarWizardPeloIdService.execute(Number(wizardId));
        setPdi(response.data);
      }
    };

    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
      router.push('/login');
      return;
    }
    fetchData();
    setRender(true);
  }, [router, wizardId]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleResumo = async () => {
    setLoading(true);
    const response = await geraResumoPdiService.execute(pdi!);
    setDialogContent(response.data);
    setLoading(false);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  if (!render) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {pdi && pdi.passos.length > 0 ? (
          pdi.passos.map((passo, passoIndex) => (
            <Box key={passoIndex} sx={{ width: '100%', mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {passo.tipo.titulo}
              </Typography>
              <Grid container spacing={2}>
                {passo.itens.map((item, itemIndex) => (
                  <Grid item key={itemIndex} xs="auto">
                    <Card sx={{ maxWidth: 250, minHeight: 250 }} elevation={5}>
                      <CardContent>
                        <Typography sx={{ mb: 2 }} variant="h6">
                          {item.titulo}
                        </Typography>
                        <Typography>
                          {item.descricao}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        ) : (
          <Typography>Nenhum dado disponível</Typography>
        )}
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleClose} sx={{ mr: 2 }}>
            Fechar
          </Button>
          <Button variant="contained" color="secondary" onClick={handlePrint} sx={{ mr: 2 }}>
            Imprimir
          </Button>
          <Button variant="contained" color="primary" onClick={handleResumo} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'GERAR RESUMO'}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>Resumo</DialogTitle>
        <DialogContent dividers>
          <div dangerouslySetInnerHTML={{ __html: dialogContent }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}