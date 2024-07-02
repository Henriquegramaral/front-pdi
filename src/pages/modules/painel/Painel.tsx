import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import { UsuarioEntity } from '../cadastro/domain/entities/UsuarioEntity';
import { Card, CardActions, CardContent, Fab, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PegarWizardsPeloIdDoUsuarioService from '../wizard/domain/services/PegarWizardsPeloIdDoUsuario.service';
import { CabecalhoPdiEntity } from '../wizard/domain/entities/CabecalhoPdiEntity';
import DeletarWizardPeloIdService from '../wizard/domain/services/DeletarWizardPeloId.service';
import Swal from 'sweetalert2';

const pegarWizardsPeloIdDoUsuarioService: PegarWizardsPeloIdDoUsuarioService = new PegarWizardsPeloIdDoUsuarioService();
const deletarWizardPeloIdService: DeletarWizardPeloIdService = new DeletarWizardPeloIdService();

export default function Painel() {
  const router = useRouter();
  const [render, setRender] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<UsuarioEntity>();
  const [pdis, setPdis] = React.useState<CabecalhoPdiEntity[]>([]);

  const optionsDate: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };  

  React.useEffect(() => {
      const fetchData = async (userId: number) => {
        const response = await pegarWizardsPeloIdDoUsuarioService.execute(userId);
        console.log(response.data);
        setPdis(response.data);
      };

      const usuarioLogado = localStorage.getItem('usuarioLogado');
      if (!usuarioLogado) {
          router.push('/login');
          return;
      }
      const user: UsuarioEntity = JSON.parse(usuarioLogado);
      setUser(user);  
      fetchData(user.id);    
      setRender(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    router.push('/login');
  };

  if(!render){
    return null;
  }

  const removerPdi = async (id: number) => {
    Swal.fire({
      title: 'Você tem certeza que deseja remover o PDI?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, confirmar!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deletarWizardPeloIdService.execute(id);
        const response = await pegarWizardsPeloIdDoUsuarioService.execute(user!.id);
        setPdis(response.data);
      }
    });    
  }

  const editarPdi = async (id: number) => {
    router.push({pathname: '/wizard', query: {wizardId: id}})
  }

  const visualizarPdi = async (id: number) => {
    router.push({pathname: '/visualizar', query: {wizardId: id}})
  }  

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar sx={{ position: 'relative' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            PDI MAKER
          </Typography>
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            Seja bem vindo, {user?.nome}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 'calc(100vh - 150px)',
          flexDirection: 'column',
        }}
      >
        <Grid container justifyContent="center" alignItems="center" direction="column">
          <Fab
            color="primary"
            sx={{ minHeight: 100, minWidth: 100 }}
            aria-label="add"
            onClick={() => {
              router.push('/wizard');
            }}
          >
            <AddIcon sx={{ fontSize: 50 }} />
          </Fab>
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Criar novo Plano de Desenvolvimento Individual
          </Typography>
        </Grid>
        <Grid container spacing={2} mt={2}>
          {pdis && pdis.length > 0 ? (
            pdis.map((pdi, _) => (
              <Grid item key={pdi.id}>
                <Card sx={{ maxWidth: 250, minHeight: 250 }} elevation={5}>
                  <CardContent>
                    <Typography sx={{ mb: 2 }} variant="h6">
                      {pdi.titulo}
                    </Typography>
                    <Typography variant="body2" sx={{ wordWrap: 'break-word', mb: 2 }}>
                      Area de atuação: {pdi.area}
                    </Typography>
                    <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                      Data de criação: {new Date(pdi.dataCadastro).toLocaleString('pt-BR', optionsDate)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                  <Button size="small" onClick={(_) => visualizarPdi(pdi.id)}>
                      VISUALIZAR
                    </Button>                    
                    <Button size="small" onClick={(_) => editarPdi(pdi.id)}>
                      EDITAR
                    </Button>
                    <Button size="small" onClick={(_) => removerPdi(pdi.id)}>
                      EXCLUIR
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <></>
          )}
        </Grid>
      </Box>
    </Box>
  );
}