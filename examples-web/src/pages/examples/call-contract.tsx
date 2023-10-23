import cn from "classnames";
import type { NextPage } from "next";
import React, { useState } from "react";
import {
  sendMessageToAvalanche,
  getAvalancheMessage,
  getAvalancheSourceChain,
} from "helpers";
import { initialize } from "zokrates-js";
import { useEffect } from "react";

const CallContract: NextPage = () => {
  const [msg, setMsg] = useState<string>("");
  const [sourceChain, setSourceChain] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [zokrate, setZokrate] = useState<any>("");
  // const [proof, setProof] = useState<any>("");
  const [verify, setVerify] = useState<any>("");
  const [keyPair, setKeyPair] = useState<any>("");
  const [artifacts, setArtifacts] = useState<any>("");
  const source = `def main(private field a, field b){
      field c = a**2 - 4;
      assert(c == b);
      return;
  }`;

  useEffect(() => {
    const initializeZokrates = async () => {
      let preZokrates = await initialize();
      setZokrate(preZokrates);
      const artifacts = preZokrates.compile(source);
      const keypair = preZokrates.setup(artifacts.program);
      setArtifacts(artifacts);
      setKeyPair(keypair);
    };

    initializeZokrates();
  }, []);

  const zokrateCompute = (message: string) => {
    const { witness, output } = zokrate.computeWitness(artifacts, [
      message,
      "12", 
    ]);

    const proof = zokrate.generateProof(artifacts.program, witness, keyPair.pk);
    return proof;
  };

  const zokrateVerify = (proof: any) => {
    return zokrate.verify(keyPair.vk, proof);
  };

  async function handleOnSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    let message = formData.get("message") as string;
    let res = zokrateVerify(zokrateCompute(message))
    if (res) {
      await sendMessageToAvalanche(message).finally(() => {
        setLoading(false);
      });
    }
  }

  async function handleOnGetMessage() {
    const _msg = await getAvalancheMessage();
    const _sourceChain = await getAvalancheSourceChain();
    console.log({
      _sourceChain,
    });
    setMsg(_msg);
    setSourceChain(_sourceChain);
  }

  return (
    <div>
      <div>
        <h1 className="text-4xl font-medium text-center">
          Send message to another chain
        </h1>

        <div className="grid grid-cols-2 gap-20 mt-20 justify-items-center">
          {/* ETHEREUM CARD */}
          <div className="row-span-1 shadow-xl card w-96 bg-base-100">
            <figure
              className="h-64 bg-center bg-no-repeat bg-cover image-full"
              style={{ backgroundImage: "url('https://www.senviet.art/wp-content/uploads/edd/2021/12/dhuit.jpg')" }}
            />
            <div className="card-body">
              <h2 className="card-title">UIT (University)</h2>
              <p>Send a cross-chain message</p>
              <div className="justify-end mt-10 card-actions">
                <form
                  className="flex w-full"
                  autoComplete="off"
                  onSubmit={handleOnSubmitMessage}
                >
                  <input
                    disabled={loading}
                    required
                    type="text"
                    name="message"
                    placeholder="Enter your GPA"
                    className="w-full max-w-xs input input-bordered"
                  />
                  <button
                    className={cn("btn btn-primary ml-2", {
                      loading,
                    })}
                    type="submit"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* AVALANCHE CARD */}
          <div className="row-span-2 shadow-xl card w-96 bg-base-100">
            <figure
              className="h-64 bg-center bg-no-repeat bg-cover image-full"
              style={{ backgroundImage: "url('https://media.licdn.com/dms/image/D560BAQEZVKpU1mJ0Wg/company-logo_200_200/0/1695981678340?e=2147483647&v=beta&t=WMwIo_nyEOp4_zzBPetEmM_-Fp1S4EL-mlCWeEsbqxs')" }}
            />
            <div className="card-body">
              <h2 className="card-title">VNG (Company)</h2>
              <p>Your GPA should pass this challenge</p>
              <div>
                <label htmlFor="" className="font-bold">Challenge</label>
                <input
                  disabled={loading}
                  readOnly
                  type="text"
                  placeholder="Enter challenge"
                  value={12}
                  className="w-full max-w-xs input input-bordered"
                />
              </div>
              <div>
                <div className="w-full max-w-xs form-control">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <input
                    readOnly
                    type="text"
                    placeholder="Type here"
                    className="w-full max-w-xs input input-bordered"
                    value={msg}
                  />
                </div>
                <div className="w-full max-w-xs form-control">
                  <label className="label">
                    <span className="label-text">Source Chain</span>
                  </label>
                  <input
                    readOnly
                    type="text"
                    placeholder="Type here"
                    className="w-full max-w-xs input input-bordered"
                    value={sourceChain}
                  />
                </div>
              </div>
              <div
                className="justify-end mt-5 card-actions"
                onClick={handleOnGetMessage}
              >
                <button className="btn btn-primary">Refresh Contract</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallContract;
