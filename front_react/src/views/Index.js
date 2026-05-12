import { Card, CardHeader, CardBody, Container, Row, Col } from "reactstrap";
import { Bar, Pie } from "react-chartjs-2";
import Header from "components/Headers/Header.js";

const Index = () => {
  // Dados para os cards de aproveitamento das turmas
  const turmasData = [
    { nome: "Sala A", aproveitamento: "70%", variacao: "-50% desde última avaliação" },
    { nome: "Sala B", aproveitamento: "50%", variacao: "-20% desde última avaliação" },
    { nome: "Sala C1...", aproveitamento: "80mF", variacao: "-55% desde última avaliação" }
  ];

  // Dados para o gráfico de barras (Estatísticas da Turma por período)
  const barData = {
    labels: ["1º Período", "2º Período", "3º Período"],
    datasets: [
      {
        label: "Média de Aproveitamento",
        data: [65, 59, 80], // Valores em porcentagem
        backgroundColor: [
          "#5e72e4",
          "#2dce89",
          "#fb6340"
        ],
        borderColor: [
          "#5e72e4",
          "#2dce89",
          "#fb6340"
        ],
        borderWidth: 1
      }
    ]
  };

  // Dados para o gráfico de pizza (Notas por mês)
  const pieData = {
    labels: ["Setembro", "Outubro", "Novembro", "Dezembro"],
    datasets: [
      {
        data: [15, 20, 12, 8],
        backgroundColor: [
          "#5e72e4",
          "#2dce89",
          "#fb6340",
          "#11cdef"
        ],
        borderWidth: 0
      }
    ]
  };

  // Dados dos alunos com melhor desempenho
  const topAlunos = [
    { nome: "Háteres", nota: "18 valores" },
    { nome: "Grazer", nota: "18 valores" },
    { nome: "Daniel", nota: "18 valores" },
    { nome: "Daniel-Jur-Park", nota: "18 valores" },
    { nome: "Mark-Rajón", nota: "18 valores" }
  ];

  return (
    <>
      <Header />
      <Container className="mt--9" fluid>
        {/* Seção de Aproveitamento das Turmas */}
        <Row className="mb-4">
          {turmasData.map((turma, index) => (
            <Col key={index} md="4">
              <Card className="shadow">
                <CardBody>
                  <h3 className="mb-1">{turma.nome}</h3>
                  <p className="text-success font-weight-bold mb-1">
                    {turma.aproveitamento} de Aproveitamento
                  </p>
                  <p className="text-danger mb-0">
                    {turma.variacao}
                  </p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Seção Principal com Gráficos */}
        <Row>
          {/* Gráfico de Barras - Estatísticas da Turma */}
          <Col lg="6" className="mb-4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">Estatísticas da Turma</h2>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Bar
                    data={barData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: 'Aproveitamento (%)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Períodos Letivos'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Gráfico de Pizza - Notas por Mês */}
          <Col lg="6" className="mb-4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">Notas por Mês</h2>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Pie 
                    data={pieData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'right'
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.raw} alunos`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Seção de Alunos com Melhor Desempenho */}
        <Row>
          <Col lg="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">Alunos com melhor desempenho</h2>
              </CardHeader>
              <CardBody>
                <div className="d-flex flex-wrap">
                  {topAlunos.map((aluno, index) => (
                    <div key={index} className="mr-4 mb-3">
                      <h4 className="mb-0">{aluno.nome}</h4>
                      <p className="text-success mb-0">{aluno.nota}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;