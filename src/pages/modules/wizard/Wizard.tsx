import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ItemPdiEntity } from './domain/entities/ItemPdiEntity';
import { CabecalhoPdiEntity } from './domain/entities/CabecalhoPdiEntity';
import { PassoPdiEntity } from './domain/entities/PassoPdiEntity';
import GeraNovoWizardService from './domain/services/GeraNovoWizard.service';
import GeraDicasService from './domain/services/GeraDicas.service';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import { DicasPdiEntity } from './domain/entities/DicasPdiEntity';
import SalvaWizardService from './domain/services/SalvaWizard.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import PegarWizardPeloIdService from './domain/services/PegarWizardPeloId.service';

const geraNovoWizardService: GeraNovoWizardService = new GeraNovoWizardService();
const geraDicasService: GeraDicasService = new GeraDicasService();
const salvaWizardService: SalvaWizardService = new SalvaWizardService();
const pegarWizardPeloIdService: PegarWizardPeloIdService = new PegarWizardPeloIdService();

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  card: ItemPdiEntity;
  onSave: (data: ItemPdiEntity) => void;
}

const CardForm: React.FC<CardFormProps> = ({ open, onClose, card, onSave }) => {
  const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<ItemPdiEntity>({
    defaultValues: card,
    mode: 'onChange'
  });

  React.useEffect(() => {
    reset(card);
  }, [card, reset]);

  const onSubmit = (data: ItemPdiEntity) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Controller
          name="titulo"
          control={control}
          rules={{ required: 'Título é obrigatório' }}
          render={({ field }) => <TextField {...field} label="Título" fullWidth margin="dense" error={!!errors.titulo} helperText={errors.titulo?.message} />}
        />
        <Controller
          name="descricao"
          control={control}
          rules={{ required: 'Descrição é obrigatória' }}
          render={({ field }) => <TextField {...field} label="Descrição" fullWidth margin="dense" multiline rows={8} error={!!errors.descricao} helperText={errors.descricao?.message} />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={!isValid}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

interface CardItemProps {
  card: ItemPdiEntity;
  onEdit: () => void;
  onDelete: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  return (
    <Card sx={{backgroundColor: '#FFF8DC'}}>
      <CardContent sx={{height: 200}}>
        <Typography variant="h6">{card.titulo}</Typography>
        <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
          {card.descricao}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onEdit}>Editar</Button>
        <Button size="small" onClick={onDelete}>Excluir</Button>
      </CardActions>
    </Card>
  );
};

const Wizard: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [stepsState, setStepsState] = React.useState<PassoPdiEntity[]>([]);
  const stepsStateRef = React.useRef<PassoPdiEntity[]>([]);
  const activeStepLoadingRef = React.useRef<number[]>([]);
  const [activeStepLoadingState, setActiveStepLoading] = React.useState<number[]>([]);
  const [editingCard, setEditingCard] = React.useState<{ stepIndex: number; cardIndex: number } & ItemPdiEntity | null>(null);
  const [open, setOpen] = React.useState(false);
  const [descriptionOpen, setDescriptionOpen] = React.useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });
  const [newCardOpen, setNewCardOpen] = React.useState(false);
  const [showDicas, setShowDicas] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const { wizardId } = router.query;

  const { control, handleSubmit, trigger, getValues, reset } = useForm<CabecalhoPdiEntity>({
    mode: 'onChange'
  });

  const maxSteps = stepsState.length + 1; // Inclui o passo inicial para o formulário do cabeçalho

  const handleNext = async () => {
    if (activeStep === 0) {
      const valid = await trigger();
      if (!valid) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      setError(null);
    }
    setShowDicas(true);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const handleEdit = (stepIndex: number, cardIndex: number) => {
    setEditingCard({ stepIndex, cardIndex, ...stepsState[stepIndex].itens[cardIndex] });
    setOpen(true);
  };

  const handleDelete = (stepIndex: number, cardIndex: number) => {
    const updatedSteps = stepsState.map((step, sIndex) => {
      if (sIndex === stepIndex) {
        return {
          ...step,
          itens: step.itens.filter((_, cIndex) => cIndex !== cardIndex),
        };
      }
      return step;
    });
    setStepsState(updatedSteps);
    stepsStateRef.current = updatedSteps;
  };

  const handleSave = (data: ItemPdiEntity) => {
    if (editingCard) {
      const updatedSteps = stepsState.map((step, sIndex) => {
        if (sIndex === editingCard.stepIndex) {
          const updatedItens = step.itens.map((item, cIndex) => {
            if (cIndex === editingCard.cardIndex) {
              return { ...item, titulo: data.titulo, descricao: data.descricao };
            }
            return item;
          });
          return { ...step, itens: updatedItens };
        }
        return step;
      });
      setStepsState(updatedSteps);
      stepsStateRef.current = updatedSteps;
      setEditingCard(null);
    }
  };

  const handleNewCardSave = (data: ItemPdiEntity) => {
    const newSteps = stepsState.map((step, index) => {
      if (index === activeStep - 1) {
        return {
          ...step,
          itens: [...step.itens, data]
        };
      }
      return step;
    });
    setStepsState(newSteps);
    stepsStateRef.current = newSteps;
    setNewCardOpen(false);
  };

  const handleUtilizarDica = (stepIndex: number, cardIndex: number) => {
    const updatedSteps = stepsState.map((step, sIndex) => {
      if (sIndex === stepIndex) {
        const dica = step.dicas[cardIndex];
        const newCard: ItemPdiEntity = { id: 0, titulo: dica.titulo, descricao: dica.conteudo, meta: 0 };
        return {
          ...step,
          dicas: step.dicas.filter((_, dIndex) => dIndex !== cardIndex),
          itens: [...step.itens, newCard]
        };
      }
      return step;
    });
    setStepsState(updatedSteps);
    stepsStateRef.current = updatedSteps;
  };

  const showMessage = (titulo: string, errorMessage: string, icon: SweetAlertIcon) => {
    Swal.fire({
      icon: icon,
      title: titulo,
      text: errorMessage,
    });
  };   

  const onSubmit: SubmitHandler<CabecalhoPdiEntity> = async (data: CabecalhoPdiEntity) => {
    const response = await salvaWizardService.execute({...data, passos: stepsState, usuario: (localStorage.getItem('usuarioLogado')) ? JSON.parse(localStorage.getItem('usuarioLogado') ?? '') : null});

    if (response.status == 400) {
      showMessage('Ooops...', JSON.parse(response.data).message, 'error');
      return;
    } else if (response.status == 500) {
        showMessage('Ooops...', 'Ocorreu um erro inesperado', 'error');
        return;
    }    
    showMessage('Muito Bem...', 'PDI Cadastrado com sucesso!', 'success');
    router.push('/painel');
  };

  React.useEffect(() => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
      router.push('/login');
      return;
    }
    geraNovoWizard();
  }, [router]);

  React.useEffect(() => {
    geraDicas();
  }, [activeStep]);

  const geraNovoWizard = async () => {
    let response;
    if(wizardId){
      response = await pegarWizardPeloIdService.execute(Number(wizardId));  
    }else{
      response = await geraNovoWizardService.execute();
    }
    reset(response.data);   
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if(getValues() && usuarioLogado){
      getValues().usuario = JSON.parse(usuarioLogado);
    }
    setStepsState(getValues().passos ? [...getValues().passos] : []);
    stepsStateRef.current = getValues().passos ? [...getValues().passos] : [];
  };  

  const geraDicas = async () => {
    if(activeStepLoadingState.length > 0){
      return;
    }
    for (let i = activeStep - 1; i < stepsStateRef.current.length; i++) {
      if (stepsStateRef.current[i] && (!stepsStateRef.current[i].dicas || stepsStateRef.current[i].dicas.length === 0) && getValues()) {
        geraDica(i);
      }
    } 
  };

  const geraDica = async (i: number) => {
    const activeLoadingUpdated = [...activeStepLoadingRef.current];
    activeLoadingUpdated.push(i + 1);
    setActiveStepLoading(activeLoadingUpdated);
    activeStepLoadingRef.current = activeLoadingUpdated;
    const response = await geraDicasService.execute({ area: getValues().area, current: stepsStateRef.current[i].tipo.titulo, descricaoPasso: stepsStateRef.current[i].tipo.descricao });
    const responseDicas: DicasPdiEntity[] = response.data;
    const copySteps: PassoPdiEntity[] = [...stepsStateRef.current];
    copySteps[i].dicas = responseDicas;
    setStepsState(copySteps);
    stepsStateRef.current = [...copySteps];
    const activeLoadingUpdatedRemove = [...activeStepLoadingRef.current];
    setActiveStepLoading(activeLoadingUpdatedRemove.filter(rm => rm != i+1));
    activeStepLoadingRef.current = activeLoadingUpdatedRemove.filter(rm => rm != i+1);
  }

  const handleDescriptionOpen = (title: string, description: string) => {
    setDescriptionOpen({ open: true, title, description });
  };

  const handleDescriptionClose = () => {
    setDescriptionOpen({ open: false, title: '', description: '' });
  };

  const handleToggleDicas = () => {
    setShowDicas((prev) => !prev);
  };

  return (
    <Box
      sx={{
        maxWidth: 'lg',
        margin: 'auto',
        flexGrow: 1,
        height: 'calc(100vh - 100px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        border: '1px solid black',
        padding: 2,
      }}
    >
      {activeStep === 0 && (
        <Box
          sx={{
            height: 'calc(100vh - 100px)',
            overflowY: 'auto',
          }}
        >
          <Paper
            square
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: 50,
              pl: 2,
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="h5">Informe o Título do PDI e a sua Área de Atuação/Profissão</Typography>
          </Paper>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
            <Controller
              name="titulo"
              control={control}
              rules={{ required: 'Título é obrigatório' }}
              render={({ field, fieldState }) => <TextField {...field} label="Título do PDI" fullWidth margin="dense" error={!!fieldState.error} helperText={fieldState.error?.message}  InputLabelProps={{shrink: true}}/>}
            />
            <Controller
              name="area"
              control={control}
              rules={{ required: 'Área é obrigatória' }}
              render={({ field, fieldState }) => <TextField {...field} label="Área de Atuação" fullWidth margin="dense" error={!!fieldState.error} helperText={fieldState.error?.message} InputLabelProps={{shrink: true}}/>}
            />
            {error && <Typography color="error">{error}</Typography>}
          </Box>
        </Box>
      )}
      {stepsState.map((step, index) => (
        <Box
          key={step.tipo.titulo}
          sx={{
            height: 'calc(100vh - 100px)',
            overflowY: 'auto',
            display: activeStep === index + 1 ? 'block' : 'none', // Ajusta o índice para considerar o passo inicial
          }}
        >
          <Paper
            square
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: 60,
              pl: 2,
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="h4">{step.tipo.titulo}</Typography>
            <Button
              size="large"
              onClick={() => handleDescriptionOpen(step.tipo.titulo, step.tipo.descricao)}
              sx={{ marginLeft: 'auto', marginRight: 2 }}
            >
              COMO FAZER?
            </Button>          
          </Paper>
          <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
            <Typography variant="h6">Dicas:</Typography>
            <Button
              onClick={handleToggleDicas}
              disabled={activeStepLoadingState.includes(activeStep)}
              sx={{ marginLeft: 'auto', marginRight: 2 }}
            >
              {showDicas ? 'Esconder Dicas' : 'Mostrar Dicas'}
            </Button>
          </Box>
          {activeStepLoadingState.includes(activeStep) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px' }}>
              <CircularProgress />
            </Box>
          ) : (
            showDicas && (
              <Box sx={{ display: 'flex', overflowX: 'auto', height: 'auto' }}>
                {step.dicas && step.dicas.map((dica, cardIndex) => (
                  <Card key={cardIndex} sx={{ minWidth: 350, maxWidth: 500, marginRight: 2, mb:2, backgroundColor: '#7FFFD4'}}>
                    <CardContent sx={{height: 200}}>
                      <Typography variant="h6">{dica.titulo}</Typography>
                      <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                        {dica.conteudo}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleUtilizarDica(index, cardIndex)}>
                        Utilizar
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )
          )}
          <Typography variant="h6" sx={{ padding: 2 }}>
            Adicione aqui os cards para montar seu PDI:
          </Typography>
          <Button variant="outlined" onClick={() => setNewCardOpen(true)} sx={{ mt: 2 }}>
            Adicionar Novo Card
          </Button>
          <Grid container spacing={2} sx={{ padding: 2 }}>
            {step.itens.map((card, cardIndex) => (
              <Grid item xs={12} sm={6} md={3} key={cardIndex}>
                <CardItem
                  card={card}
                  onEdit={() => handleEdit(index, cardIndex)}
                  onDelete={() => handleDelete(index, cardIndex)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}      
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          (activeStep === maxSteps - 1) && activeStepLoadingState.length == 0 ? (
            <Button size="small" onClick={handleSubmit(onSubmit)}>
              Finalizar
            </Button>
          ) : (
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStepLoadingState.includes(activeStep)}
            >
              Próximo
              {theme.direction === 'rtl' ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          )
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
            Voltar
          </Button>
        }
      />
      {editingCard && (
        <CardForm
          open={open}
          onClose={() => setOpen(false)}
          card={editingCard}
          onSave={handleSave}
        />
      )}     
            <Button
              size="large"
              onClick={() => {router.push('/painel')}}
              sx={{ marginLeft: 'auto', marginRight: 2, ml: 64, width: 170}}
            >
              CANCELAR PDI
            </Button>         
      <Dialog open={descriptionOpen.open} onClose={handleDescriptionClose}>
        <DialogTitle>{descriptionOpen.title}</DialogTitle>
        <DialogContent>
          <Typography>{descriptionOpen.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDescriptionClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={newCardOpen} onClose={() => setNewCardOpen(false)}>
        <DialogContent>
          <CardForm
            open={newCardOpen}
            onClose={() => setNewCardOpen(false)}
            card={{ id: 0, titulo: '', descricao: '', meta: 0 }}
            onSave={handleNewCardSave}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Wizard;