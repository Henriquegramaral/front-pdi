import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Grid, TextField, Box, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { VerificacaoUsuarioEntity } from '../cadastro/domain/entities/VerificacaoUsuarioEntity';
import VerificaUsuarioService from './domain/services/VerificaUsuario.service';
import Swal from 'sweetalert2';

const verificaUsuarioService: VerificaUsuarioService = new VerificaUsuarioService();

function ConfirmacaoEmailPage() {
    const { control, handleSubmit } = useForm();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [render, setRender] = useState<boolean>(false);

    useEffect(() => {
        const verificacaoUsuarioEntity = localStorage.getItem('verificacaoUsuarioEntity');
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (usuarioLogado) {
            router.push('/painel');
            return;
        }else
        if(!verificacaoUsuarioEntity){
            router.push('/login')
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

    async function onSubmit(data: any) {
        const verificacaoUsuarioString = localStorage.getItem('verificacaoUsuarioEntity');
        if (verificacaoUsuarioString) {
          const verificacaoUsuario: VerificacaoUsuarioEntity = JSON.parse(verificacaoUsuarioString);
          verificacaoUsuario.codigoVerificacaoDigitadoUsuario = data.codigoConfirmacao;

          const verificaUsuarioResponse = await verificaUsuarioService.execute(verificacaoUsuario);
          
          if (verificaUsuarioResponse.status == 400) {
            showError(JSON.parse(verificaUsuarioResponse.data).message);
            return;
        } else if (verificaUsuarioResponse.status == 500) {
            showError('Ocorreu um erro inesperado');
            return;
        }

        localStorage.removeItem('verificacaoUsuarioEntity');
        localStorage.setItem('usuarioLogado', JSON.stringify(verificaUsuarioResponse.data.usuario));

        router.push('/painel')

        } else {
          router.push('/login')
        }
      };

    const reenviarEmail = () => {
        // Lógica para reenviar o e-mail de confirmação
        enqueueSnackbar('E-mail de confirmação reenviado!', { variant: 'success' });
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
                                name="codigoConfirmacao"
                                control={control}
                                defaultValue=""
                                rules={{ 
                                    required: 'O código de confirmação é obrigatório'
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <TextField
                                        required
                                        {...field}
                                        sx={{ width: '100%' }}
                                        label="Código de Confirmação"
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={12} sm={12} xs={12} display="flex" justifyContent={'center'}>
                            <Button type="submit" variant="contained" color="primary">
                                Confirmar
                            </Button>
                            <Button sx={{ ml: 2 }} variant="contained" color="secondary" onClick={reenviarEmail}>
                                Reenviar E-mail
                            </Button>
                        </Grid>
                    </Grid>
                </SnackbarProvider>
            </form>
        </Box>
    );
}

export default function ConfirmacaoEmail() {
    return (
      <SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
        <ConfirmacaoEmailPage />
      </SnackbarProvider>
    );
}