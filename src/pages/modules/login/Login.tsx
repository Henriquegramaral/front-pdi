import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { UsuarioEntity } from '../cadastro/domain/entities/UsuarioEntity';
import LoginService from './domain/services/Login.service';
import Swal from 'sweetalert2';

const loginService: LoginService = new LoginService();

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Login() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<UsuarioEntity>();
  const [render, setRender] = React.useState<boolean>(false);

  React.useEffect(() => {
      const usuarioLogado = localStorage.getItem('usuarioLogado');
      if (usuarioLogado) {
          router.push('/painel');
          return;
      }
      setRender(true);
  }, [router]);

  const showError = (errorMessage: string) => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: errorMessage,
    });
 };   

  async function onSubmit(data: UsuarioEntity) {
    try {
      const loginResponse = await loginService.execute(data);

      if (loginResponse.status === 400) {
          showError(loginResponse.data.message);
          return;
      } else if (loginResponse.status == 500) {
          showError('Ocorreu um erro inesperado');
          return;
      }

      localStorage.setItem('usuarioLogado', JSON.stringify(loginResponse.data));

      router.push('/painel');
  } catch (error) {
      showError('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      console.error('Erro no cadastro:', error);
  } 
  };

  if(!render){
    return null;
  }  

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://wallpapers.com/images/featured/business-jzw8ax93flqonkce.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h3">
              PDI MAKER
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                rules={{ required: "Email é obrigatório" }}
                render={({ field }) => 
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
                  />
                }
              />
              <Controller
                name="senha"
                control={control}
                defaultValue=""
                rules={{ required: "Senha é obrigatória" }}
                render={({ field }) => 
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    name="senha"
                    label="Senha"
                    type="password"
                    id="senha"
                    autoComplete="current-password"
                    error={!!errors.senha}
                    helperText={errors.senha ? errors.senha.message : ''}
                  />
                }
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Logar
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Esqueceu a senha?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" onClick={() => {router.push('/cadastro')}}>
                    {"Não possui uma conta? Cadastre-se!"}
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}