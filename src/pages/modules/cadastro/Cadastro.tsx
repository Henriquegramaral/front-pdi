import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, TextField, Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { UsuarioEntity } from './domain/entities/UsuarioEntity';
import CadastrarUsuarioService from './domain/services/CadastrarUsuario.service';
import Swal from 'sweetalert2';

const cadastrarUsuarioService: CadastrarUsuarioService = new CadastrarUsuarioService();

function Cadastro() {
    const { control, handleSubmit, getValues, formState: { errors } } = useForm<UsuarioEntity>();
    const router = useRouter();
    const passwordRef = useRef<HTMLInputElement>(null);
    const { enqueueSnackbar } = useSnackbar();
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


    async function onSubmit (data: UsuarioEntity) {
        try {
            const verificacaoUsuarioEntity = await cadastrarUsuarioService.execute(data);

            if (verificacaoUsuarioEntity.status === 400) {
                showError(verificacaoUsuarioEntity.data.message);
                return;
            } else if (verificacaoUsuarioEntity.status == 500) {
                showError('Ocorreu um erro inesperado');
                return;
            }

            localStorage.setItem('verificacaoUsuarioEntity', JSON.stringify(verificacaoUsuarioEntity.data));

            router.push('/confirmacaoemail');
        } catch (error) {
            showError('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
            console.error('Erro no cadastro:', error);
        }        
    };

    const validatePassword = (_: string) => {
        if (getValues('senha') != getValues('confirmeSenha')) {
            enqueueSnackbar('As senhas não coincidem!', {variant: 'error'}); 
            return 'As senhas não coincidem!';
        }
        return true;
    };    

    if(!render){
        return null;
    }    

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 150px)',
                flexDirection: 'column'
            }}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <SnackbarProvider maxSnack={3}>
                    <Grid container spacing={2} maxWidth={'sm'} justifyContent="center">
                        <Grid item md={12} sm={12} xs={12} display="flex" justifyContent="center">
                            <Box
                                component="img"
                                src="/assets/images/pdi.png"
                                alt="Descrição da imagem"
                                sx={{
                                    width: '70%',
                                    height: 'auto',
                                    borderRadius: '50%',
                                    mb: 2
                                }}
                            />
                        </Grid>
                        <Grid item md={12} sm={12} xs={12}>
                            <Controller
                                name="nome"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        required
                                        autoFocus
                                        {...field}
                                        sx={{ width: '100%' }}
                                        label="Nome"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={12} sm={12} xs={12}>
                            <Controller
                                name="email"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        required
                                        {...field}
                                        sx={{ width: '100%' }}
                                        label="E-mail"
                                        type="email"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={12} sm={12} xs={12}>
                            <Controller
                                name="senha"
                                control={control}
                                defaultValue=""
                                rules={{                                  
                                    validate: validatePassword,
                                }}                                
                                render={({ field }) => (
                                    <TextField
                                        required
                                        {...field}
                                        inputRef={passwordRef}
                                        sx={{ width: '100%' }}
                                        label="Senha"
                                        type="password"
                                        error={!!errors.senha}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={12} sm={12} xs={12}>
                            <Controller
                                name="confirmeSenha"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <TextField
                                        required
                                        {...field}
                                        sx={{ width: '100%' }}
                                        label="Confirme a senha"
                                        type="password"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={12} sm={12} xs={12} display="flex" justifyContent={'center'}>
                            <Button type="submit" variant="contained" color="primary">
                                Registrar
                            </Button>
                            <Button sx={{ml: 2}} variant="contained" color="primary" onClick={(_) => {router.push('/login')}}>
                                Logar
                            </Button>                        
                        </Grid>
                    </Grid>
                </SnackbarProvider>
            </form>
        </Box>
    );
}

export default function IntegrationNotistack() {
    return (
      <SnackbarProvider maxSnack={3} anchorOrigin={{horizontal: 'center', vertical: 'top'}}>
        <Cadastro />
      </SnackbarProvider>
    );
}