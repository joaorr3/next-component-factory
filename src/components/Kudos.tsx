import { ReactSlipAndSlide } from "react-slip-and-slide";
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { shuffle } from "lodash";
import Image from "next/image";
import React from "react";
import { Radar } from "react-chartjs-2";
import styled, { css } from "styled-components";
import type { ParsedKudos } from "../shared/dataUtils";
import { useTheme } from "../styles/ThemeProvider";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const customScrollBarBase = css`
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme: { textColor } }) => textColor};
    border-radius: 8px;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: ${({ theme: { textColor } }) => textColor};
  }
`;

export const Kudos = () => {
  const kudos = trpc.kudos.all.useQuery();

  useLoading(kudos.isLoading);

  if (!kudos.data) {
    return <React.Fragment />;
  }

  return (
    <ReactSlipAndSlide
      data={shuffle(kudos.data)}
      itemWidth={300}
      itemHeight={500}
      overflowHidden={false}
      renderItem={({ item, index }) => {
        return <KudosCard key={index} {...item} />;
      }}
    />
  );
};

const KudosCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 0px;
  margin: 0px 8px;
  border: 1px solid #cacaca;
  border-radius: 12px;
  width: 100%;
  align-items: center;
  transition: 420ms box-shadow cubic-bezier(0.37, 0.13, 0.5, 1.08);
  background-color: ${({ theme: { backgroundColorSecondary } }) =>
    backgroundColorSecondary};
  box-shadow: 0px 4px 20px 4px #00000010;
  user-select: none;
  cursor: grab;

  &:hover {
    box-shadow: 0px 8px 20px 6px #00000026;
  }
  &:active {
    cursor: grabbing;
  }
`;

const ScrollView = styled.div`
  ${customScrollBarBase}
  width: 100%;
  height: 80px;
  overflow-y: scroll;
  margin-right: 5px;
`;

const KudosCard = ({ user, kudos }: ParsedKudos) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <KudosCardContainer>
        <Avatar
          name={user.name}
          avatarURL={user.avatarURL}
          color={user.color}
        />

        <h3
          style={{
            marginBottom: 16,
            marginTop: 12,
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          {user.name}
        </h3>

        <ScrollView>
          <div style={{ marginLeft: 16, marginRight: 5 }}>
            {Object.entries(kudos).map(([k, v], i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  marginBottom: 4,
                  justifyContent: "space-between",
                }}
              >
                <p>{k}</p>
                <p>{v}</p>
              </div>
            ))}
          </div>
        </ScrollView>

        <Spider user={user} kudos={kudos} />
      </KudosCardContainer>
    </div>
  );
};

const Avatar = ({ name, avatarURL }: ParsedKudos["user"]) => {
  return (
    <div>
      <div
        style={{
          borderRadius: 80,
          width: 80,
          height: 80,
          overflow: "hidden",
        }}
      >
        {avatarURL ? (
          <Image src={avatarURL} width={80} height={80} alt="user image" />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center dark:text-neutral-100"
            style={{
              backgroundColor: "#969696",
            }}
          >
            <h3
              style={{
                marginBottom: 16,
                marginTop: 12,
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              {name
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

const Spider = ({ kudos }: ParsedKudos) => {
  const ks = Object.entries(kudos).map(([k, _]) => k);
  const vs = Object.entries(kudos).map(([_, v]) => v);

  const { backgroundColorSecondary, textColor } = useTheme();

  return (
    <div style={{ width: 250, height: 250 }}>
      <Radar
        options={{
          responsive: true,
          scales: {
            r: {
              angleLines: {
                display: false,
              },
              grid: {
                display: false,
              },
              pointLabels: {
                font: {
                  size: 12,
                  weight: "800",
                },
                color: textColor,
                padding: 20,
              },
              ticks: {
                display: false,
              },
              beginAtZero: true,
            },
          },
          plugins: {
            tooltip: {
              displayColors: false,
              caretPadding: 20,
              caretSize: 6,
            },
          },
        }}
        width={250}
        height={250}
        data={{
          labels: ks,
          datasets: [
            {
              data: vs,
              backgroundColor: backgroundColorSecondary,
              borderWidth: 1,
              borderColor: "#919191",
              tension: 0.6,
              pointBackgroundColor: "#ffffff",
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        }}
      />
    </div>
  );
};
